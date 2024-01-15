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
import { markTeamAsBuzzedIn } from "./utilities";

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
          console.log(
            "Error: player failed to join game, no roomId of ",
            roomId
          );
          return;
        }

        const playerNameAlreadyExists = Object.values(
          rooms[roomId].players || {}
        ).find((player) => player.name === playerName);

        if (playerNameAlreadyExists) {
          return;
        }

        socket.roomId = roomId;
        socket.join(roomId);

        console.log("A player has joined", playerName, roomId);
        const returnedPlayer = rooms[roomId].playersThatLeft.find(
          (player) => player?.name && player.name === playerName
        );
        const filteredPlayersThatLeft = rooms[roomId].playersThatLeft.filter(
          (player) => player?.name && player.name !== playerName
        );
        if (returnedPlayer) {
          // if the person who left and came back was the activePlayer
          // or the lastActivePlayer, let's update their socketId
          if (rooms[roomId].activePlayer === returnedPlayer.socketId) {
            rooms[roomId].activePlayer = socket.id;
          }
          if (rooms[roomId].lastActivePlayer === returnedPlayer.socketId) {
            rooms[roomId].lastActivePlayer = socket.id;
          }
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

            // all teams have attempted a guess
            if (
              rooms[roomId].incorrectGuesses.length === activePlayers.length ||
              rooms[roomId].dailyDoubleAmount
            ) {
              rooms[roomId].game.rounds[rooms[roomId].round - 1][
                arrayIndex
              ].clues[clueIndex].alreadyPlayed = true;
              rooms[roomId].incorrectGuesses = [];
              rooms[roomId].isBuzzerActive = false;
              rooms[roomId].firstBuzz = false;
              if (rooms[roomId].dailyDoubleAmount) {
                (rooms[roomId].dailyDoubleAmount as number) *= -1;
              }
            }
            // answered correctly
          } else {
            rooms[roomId].game.rounds[rooms[roomId].round - 1][
              arrayIndex
            ].clues[clueIndex].alreadyPlayed = true;
            rooms[roomId].incorrectGuesses = [];
            rooms[roomId].isBuzzerActive = false;
            rooms[roomId].firstBuzz = false;
          }

          const updatedScore = rooms[roomId].dailyDoubleAmount || score;
          const playerThatScored =
            rooms[roomId].activePlayer || rooms[roomId].lastActivePlayer;

          // @TODO: when the player leaves after they buzz in but before they are marked correct/incorrect
          // we can't update their score. look into this
          if (playerThatScored && rooms[roomId].players[playerThatScored]) {
            rooms[roomId].players[playerThatScored].score += updatedScore;

            console.log(
              `${
                rooms[roomId].players[playerThatScored].name
              } score changed from ${
                rooms[roomId].players[playerThatScored].score - updatedScore
              } to ${rooms[roomId].players[playerThatScored].score}`,
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
          rooms[roomId].secondPlace = null;
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

      socket.on("A player hits the buzzer", (roomId, clientTimeStamp) => {
        if (
          !rooms[roomId] ||
          !rooms[roomId].isBuzzerActive ||
          rooms[roomId].incorrectGuesses.includes(socket.id)
        ) {
          return;
        }
        if (rooms[roomId].activePlayer) return;

        const activePlayers = Object.values(rooms[roomId].players).filter(
          (x) => x.name
        );

        if (
          activePlayers.length - rooms[roomId].incorrectGuesses.length ===
          1
        ) {
          // if only one team left to attempt a guess
          // have them buzz in right away
          markTeamAsBuzzedIn(rooms[roomId], socket.id);
          io.to(roomId).emit("gameState updated", rooms[roomId]);
          return;
        }

        socket.emit("buzzer hit ping", clientTimeStamp, new Date().getTime());

        // first player to buzz in starts the latency time out
        // to determine who actually buzzed in first
        if (!rooms[roomId].firstBuzz) {
          rooms[roomId].firstBuzz = true;
          io.to(roomId).emit("gameState updated", rooms[roomId]);

          const buzzerCheckTimeoutId = setTimeout(() => {
            // determine who buzzed in first from buzzerHits

            const sortedTeams = Object.values(rooms[roomId].buzzerHits).sort(
              (a, b) => (a.timestamp > b.timestamp ? 1 : -1)
            );
            const firstPlayerToBuzzIn = sortedTeams[0].socketId;

            markTeamAsBuzzedIn(rooms[roomId], firstPlayerToBuzzIn);

            if (
              sortedTeams[1] &&
              rooms[roomId].players?.[sortedTeams[1].socketId]?.name
            ) {
              rooms[roomId].secondPlace = {
                name: rooms[roomId].players[sortedTeams[1].socketId].name,
                amountInMs: sortedTeams[1].timestamp - sortedTeams[0].timestamp,
              };
            }

            io.to(roomId).emit("gameState updated", rooms[roomId]);
            clearTimeout(buzzerCheckTimeoutId);
          }, 1000);
        } else {
          io.to(roomId).emit("gameState updated", rooms[roomId]);
        }
      });

      socket.on("buzzer hit pong", (roomId, ping, serverTimeStamp) => {
        if (!rooms[roomId]) {
          return;
        }

        // register buzzer hit
        if (!rooms[roomId].buzzerHits[socket.id]) {
          rooms[roomId].buzzerHits[socket.id] = {
            timestamp: serverTimeStamp - ping / 2,
            socketId: socket.id,
          };
        }
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
          rooms[roomId].firstBuzz = false;
          rooms[roomId].secondPlace = null;

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

      socket.on("Team selects a daily double clue", (roomId, socketId) => {
        if (!rooms[roomId]) {
          return;
        }
        const lastActivePlayer = rooms[roomId].lastActivePlayer;
        if (!lastActivePlayer || !rooms[roomId].players[lastActivePlayer]) {
          rooms[roomId].lastActivePlayer = socketId;
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
        if (!rooms[roomId] || !rooms[roomId].players[socket.id]) {
          return;
        }
        // if they had a name and left, let them rejoin with old score
        if (
          rooms[roomId].players?.[socket.id]?.name &&
          !rooms[roomId].playersThatLeft.find(
            (player) => player.name === rooms[roomId].players[socket.id].name
          )
        ) {
          console.log(
            "DISCONNECTED",
            rooms[roomId].players?.[socket.id]?.name,
            rooms[roomId].playersThatLeft.map((player) => player.name)
          );
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
