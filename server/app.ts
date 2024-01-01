import dotenv from "dotenv";
dotenv.config();
import { Socket } from "socket.io";
import mongoose from "mongoose";
import {
  ClientToServerEvents,
  Players,
  ServerToClientEvents,
} from "../stateTypes";
import { rooms } from "./rooms";
import { io } from "./io";
import { httpServer } from "./httpServer";
import { createDefaultGameState } from "./createDefaultGameState";

// Start the server
const port = Number(process.env.PORT || 5000);
httpServer.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

async function start() {
  try {
    await mongoose.connect(process.env.MONGO_URI || "", {
      writeConcern: {
        w: "majority",
        j: true,
        wtimeoutMS: 1000,
      },
    });
    console.log("Connected to MongoDB...");
  } catch (err) {
    console.error("Failed to connect to MongoDB...", err);
  }

  io.on(
    "connect",
    function (
      socket: Socket<ClientToServerEvents, ServerToClientEvents> & {
        roomId?: string;
      }
    ) {
      socket.on("ping", (timestamp) => {
        socket.emit("pong", timestamp);
      });
      socket.on("Set ping of a phone buzzer", (roomId, timestamp) => {
        if (!rooms[roomId] || !rooms[roomId].players[socket.id]) {
          return;
        }
        rooms[roomId].players[socket.id].ping = timestamp;
      });

      socket.on("User gets updated game state", async (roomId) => {
        if (!rooms[roomId]) {
          rooms[roomId] = await createDefaultGameState({ newRoomId: roomId });
        }
        socket.join(roomId);
        socket.emit("gameState updated", rooms[roomId]);
      });

      socket.on(
        "Host refreshes the room code",
        async (newRoomId, previousRoomId) => {
          const gameState = await createDefaultGameState({
            newRoomId: newRoomId || undefined,
          });
          const roomId = gameState.guid;
          rooms[roomId] = gameState;
          socket.join(roomId);
          if (previousRoomId) {
            delete rooms[previousRoomId];
          }
          console.log("Host refreshes the room code", newRoomId, {
            roomId,
          });
          io.to(roomId).emit("gameState updated", rooms[roomId]);
          if (previousRoomId) {
            io.to(previousRoomId).emit("gameState updated", rooms[roomId]);
          }
        }
      );

      socket.on("Host restarts the game", async (gameName, roomId, userId) => {
        if (!rooms[roomId]) {
          return;
        }
        console.log("Host restarts the game", roomId, gameName, userId);
        rooms[roomId] = await createDefaultGameState({
          newRoomId: roomId,
          specificGameName: gameName,
          userId,
          previousPlayers: Object.fromEntries(
            Object.entries(rooms[roomId].players).map(
              ([socketId, playerObject]) => [
                socketId,
                { ...playerObject, score: 0 },
              ]
            )
          ),
        });

        io.to(roomId).emit("gameState updated", rooms[roomId]);
      });

      socket.on(
        "Host changes the game",
        async (
          gameName: string,
          players: Players | undefined,
          roomId,
          userId
        ) => {
          if (!rooms[roomId] || gameName === rooms[roomId].name) {
            return;
          }
          console.log("Host changes up the game", gameName, roomId, userId);
          rooms[roomId] = await createDefaultGameState({
            userId,
            newRoomId: roomId,
            specificGameName: gameName,
            previousPlayers: players,
          });

          io.to(roomId).emit("gameState updated", rooms[roomId]);
        }
      );

      socket.on("player signed up", (playerName, roomId) => {
        if (!rooms[roomId]) {
          return;
        }

        socket.roomId = roomId;
        socket.join(roomId);

        console.log("A player has joined", playerName);
        const returnedPlayer = rooms[roomId].playersThatLeft.find(
          (player) => player?.name && player.name === playerName
        );
        const filteredPlayersThatLeft = rooms[roomId].playersThatLeft.filter(
          (player) => player?.name && player.name !== playerName
        );
        if (returnedPlayer) {
          returnedPlayer.socketId = socket.id;
          rooms[roomId].players[socket.id] = returnedPlayer;
          rooms[roomId].playersThatLeft = filteredPlayersThatLeft;
          socket.emit("player successfully added to game");
        } else {
          rooms[roomId].players[socket.id] = {
            name: "",
            socketId: socket.id,
            score: 0,
            ping: 0,
          };
          rooms[roomId].players[socket.id].name = playerName;
          socket.emit("gameState updated", rooms[roomId]);
          socket.emit("player successfully added to game");
        }
        io.to(roomId).emit("gameState updated", rooms[roomId]);
      });

      socket.on(
        "A player answers the clue",
        ({ value: score, clueIndex, arrayIndex, roomId, userId }) => {
          if (!rooms[roomId]) {
            return;
          }

          // answered incorrectly
          if (score < 0) {
            if (rooms[roomId].activePlayer) {
              rooms[roomId].incorrectGuesses.push(
                rooms[roomId].activePlayer as string
              );
            }
            rooms[roomId].isBuzzerActive = true;

            const activePlayers = Object.values(rooms[roomId].players).filter(
              (x) => x.name
            );

            if (
              rooms[roomId].incorrectGuesses.length === activePlayers.length ||
              rooms[roomId].dailyDoubleAmount
            ) {
              rooms[roomId].game.rounds[rooms[roomId].round - 1][
                arrayIndex
              ].clues[clueIndex].alreadyPlayed = true;
              rooms[roomId].incorrectGuesses = [];
              rooms[roomId].isBuzzerActive = false;
              if (rooms[roomId].dailyDoubleAmount) {
                (rooms[roomId].dailyDoubleAmount as number) *= -1;
              }
            }
            // answered correctly
          } else {
            rooms[roomId].incorrectGuesses = [];
            rooms[roomId].isBuzzerActive = false;
            rooms[roomId].game.rounds[rooms[roomId].round - 1][
              arrayIndex
            ].clues[clueIndex].alreadyPlayed = true;
          }

          const updatedScore = rooms[roomId].dailyDoubleAmount || score;
          const playerThatScored =
            rooms[roomId].activePlayer || rooms[roomId].lastActivePlayer;

          // @TODO: when the player leaves after they buzz in but before they are marked correct/incorrect
          // we can't update their score. look into this
          if (playerThatScored && rooms[roomId].players[playerThatScored]) {
            rooms[roomId].players[playerThatScored].score += updatedScore;

            console.log(
              `${rooms[roomId].players[playerThatScored].name} score changed from ${rooms[roomId].players[playerThatScored].score} to ${updatedScore}`,
              { roomId, userId }
            );

            const player = rooms[roomId].players[playerThatScored!];

            rooms[roomId].history.push({
              ...player,
              name: player.name || "N/A",
              socket: playerThatScored || "N/A",
              score: updatedScore,
              totalScore: player.score,
              answer: updatedScore > 0 ? "correct" : "incorrect",
              timeStamp: new Date(),
            });
          }

          rooms[roomId].dailyDoubleAmount = 0;
          rooms[roomId].activePlayer = null;
          io.to(roomId).emit("gameState updated", rooms[roomId]);
        }
      );

      socket.on("Host modifies the score", (player) => {
        const { roomId } = player;
        if (!rooms[roomId] || !rooms[roomId].players[player.socket]) {
          return;
        }
        rooms[roomId].players[player.socket].score += player.score;
        rooms[roomId].history.push({
          name: player.name,
          score: player.score,
          totalScore: rooms[roomId].players[player.socket].score,
          answer: player.score > 0 ? "correct" : "incorrect",
          timeStamp: new Date(),
          socket: player.socket,
        });
        io.to(roomId).emit("gameState updated", rooms[roomId]);
      });

      socket.on("Host selects a clue", (activeClue, roomId) => {
        if (!rooms[roomId]) {
          return;
        }
        rooms[roomId].previousClue = rooms[roomId].activeClue;
        rooms[roomId].activeClue = activeClue;
        io.to(roomId).emit("gameState updated", rooms[roomId]);
      });

      socket.on("Host deselects a clue", (roomId) => {
        if (!rooms[roomId]) {
          return;
        }
        rooms[roomId].isBuzzerActive = false;
        rooms[roomId].activeClue = rooms[roomId].previousClue;
        io.to(roomId).emit("gameState updated", rooms[roomId]);
      });

      socket.on(
        "A player sets daily double wager",
        ({ dailyDoubleAmount }, roomId) => {
          console.log("a player sets daily double wager", {
            roomId,
            dailyDoubleAmount,
          });
          if (!rooms[roomId]) {
            return;
          }
          rooms[roomId].dailyDoubleAmount = dailyDoubleAmount;
          io.to(roomId).emit("gameState updated", rooms[roomId]);
        }
      );

      socket.on("Host activates the buzzers", (roomId) => {
        if (!rooms[roomId]) {
          return;
        }
        rooms[roomId].isBuzzerActive = true;
        io.to(roomId).emit("Buzzers are activated");
      });

      socket.on("A player hits the buzzer", (roomId) => {
        if (!rooms[roomId]) {
          return;
        }
        if (rooms[roomId].activePlayer) return;
        rooms[roomId].activePlayer = socket.id;
        rooms[roomId].lastActivePlayer = socket.id;
        rooms[roomId].isBuzzerActive = false;
        io.to(roomId).emit("gameState updated", rooms[roomId]);
      });

      socket.on(
        "A player with a button hits the buzzer",
        (playerName, roomId) => {
          if (!rooms[roomId]) {
            return;
          }
          if (rooms[roomId].activePlayer) return;
          rooms[roomId].activePlayer = playerName;
          rooms[roomId].lastActivePlayer = playerName;
          rooms[roomId].isBuzzerActive = false;
          io.to(roomId).emit("gameState updated", rooms[roomId]);
        }
      );

      socket.on("Host navigates to another round", (round, roomId) => {
        if (!rooms[roomId] || rooms[roomId].round === round) {
          return;
        }
        console.log("Host navigates to another round, round: ", round);
        rooms[roomId].round = round;
        io.to(roomId).emit("gameState updated", rooms[roomId]);
      });

      socket.on(
        "No player knows the answer",
        ({ clueIndex, arrayIndex }, roomId) => {
          if (!rooms[roomId]) {
            return;
          }
          rooms[roomId].incorrectGuesses = [];
          rooms[roomId].isBuzzerActive = false;

          console.log(
            "No player knows the answer",
            rooms[roomId].game.rounds[rooms[roomId].round - 1][arrayIndex]
              .clues[clueIndex].text
          );

          rooms[roomId].game.rounds[rooms[roomId].round - 1][arrayIndex].clues[
            clueIndex
          ].alreadyPlayed = true;
          io.to(roomId).emit("gameState updated", rooms[roomId]);
        }
      );

      socket.on("Host adds a team with a button", (teamObjects, roomId) => {
        if (!rooms[roomId]) {
          return;
        }

        for (const teamObject of teamObjects) {
          rooms[roomId].players[teamObject.name] = teamObject;
          console.log("Host adds a team with a button", teamObject.name);
        }

        // emit to EVERYONE the update game state
        io.to(roomId).emit("gameState updated", rooms[roomId]);
      });

      socket.on("Team selects a daily double clue", (roomId) => {
        if (!rooms[roomId]) {
          return;
        }
        if (!rooms[roomId].lastActivePlayer) {
          const firstPlayer =
            Object.entries(rooms[roomId].players || {}).find(
              ([_, player]) => player.name
            )?.[0] || null;
          rooms[roomId].lastActivePlayer = firstPlayer;
        }
        io.to(roomId).emit("gameState updated", rooms[roomId]);
      });

      socket.on(
        "update player score manually",
        (socketId, newScore, roomId) => {
          if (!rooms[roomId] || !rooms[roomId].players[socketId]) {
            return;
          }
          const oldScore = rooms[roomId].players[socketId].score;
          const diff = newScore - oldScore;
          rooms[roomId].players[socketId].score = newScore;

          const player = rooms[roomId].players[socketId];
          rooms[roomId].history.push({
            name: player.name || "",
            score: diff,
            totalScore: rooms[roomId].players[player.socketId].score,
            answer: diff > 0 ? "correct" : "incorrect",
            timeStamp: new Date(),
            socket: player.socketId,
          });
          // emit to EVERYONE the update game state
          io.to(roomId).emit("gameState updated", rooms[roomId]);
        }
      );

      socket.on("disconnect", function () {
        const roomId = socket.roomId || "";
        if (!rooms[roomId]) {
          return;
        }
        // if they had a name and left, let them rejoin with old score
        console.log(
          "DISCONNECTED",
          rooms[roomId].players?.[socket.id]?.name,
          rooms[roomId].playersThatLeft.map((player) => player.name)
        );
        if (
          rooms[roomId].players?.[socket.id]?.name &&
          !rooms[roomId].playersThatLeft.find(
            (player) => player.name === rooms[roomId].players[socket.id].name
          )
        ) {
          rooms[roomId].playersThatLeft.push(rooms[roomId].players[socket.id]);
        }
        delete rooms[roomId].players[socket.id];
        // emit to EVERYONE the update game state
        io.to(roomId).emit("gameState updated", rooms[roomId]);
      });

      socket.on("Delete the player", async (roomId, socketId) => {
        if (!rooms[roomId]) {
          return;
        }

        console.log("delete the player", socketId);

        delete rooms[roomId].players[socketId];
        io.to(roomId).emit("gameState updated", rooms[roomId]);
      });

      socket.on("Edit player name", async (roomId, socketId, newPlayerName) => {
        if (!rooms[roomId] || !rooms[roomId].players[socketId]) {
          return;
        }

        rooms[roomId].players[socketId] = {
          ...rooms[roomId].players[socketId],
          name: newPlayerName,
        };
        io.to(roomId).emit("gameState updated", rooms[roomId]);
      });
    }
  );
}
start();
