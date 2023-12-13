import dotenv from "dotenv";
dotenv.config();
import { Server, Socket } from "socket.io";
import mongoose from "mongoose";
import http from "http";
import app from "./server";
import {
  ClientToServerEvents,
  GameState,
  Players,
  ServerToClientEvents,
} from "../stateTypes";
import {
  getPublicGames,
  createGame,
  Game,
  updateGame,
  deleteGame,
  getUserGames,
} from "./models/game";

const server = http.createServer(app);

// Start the websocket server
const io = new Server(server, {
  cors: {
    origin: `*`,
    methods: ["GET", "POST"],
  },
  pingInterval: 10000,
  pingTimeout: 300000,
});

// Start the server
const port = Number(process.env.PORT || 5000);
server.listen(port, () => {
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

  const createDefaultGameState = async ({
    newRoomId = "",
    previousRoomId,
    specificGameName,
    previousPlayers,
    userId,
  }: Partial<{
    newRoomId: string;
    previousRoomId?: string | null;
    specificGameName?: string;
    previousPlayers?: Players | undefined;
    userId?: string;
  }> = {}): Promise<GameState> => {
    const publicGames = userId
      ? await getUserGames(userId)
      : await getPublicGames();

    const gameId = previousRoomId || newRoomId;

    const previousPlayersWithoutScores: Players = Object.fromEntries(
      Object.entries(previousPlayers || {}).map(([guid, player]) => [
        guid,
        {
          ...player,
          score: 0,
        },
      ])
    );

    const selectedGame =
      specificGameName && publicGames[specificGameName]
        ? publicGames[specificGameName]
        : publicGames[Object.keys(publicGames)[0]];

    return {
      name: selectedGame.name,
      games: publicGames,
      guid: gameId,
      isBuzzerActive: false,
      activePlayer: null,
      lastActivePlayer: null,
      dailyDoubleAmount: 0,
      previousClue: null,
      activeClue: null,
      playersThatLeft: [],
      players: previousPlayersWithoutScores || {},
      gameBoard: publicGames[selectedGame.name].rounds[0],
      incorrectGuesses: [],
      history: [],
    };
  };

  // global state
  const rooms: { [roomId: string]: GameState } = {};

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
      socket.on("Host reloads the board page", async (roomId) => {
        if (!rooms[roomId]) {
          rooms[roomId] = await createDefaultGameState({ newRoomId: roomId });
        }
        socket.join(roomId);
        console.log("Host reloads the board page", roomId);
        socket.emit("gameState updated", rooms[roomId]);
      });

      socket.on("Get user created boards", async (roomId, userId) => {
        if (!roomId || !rooms[roomId] || !userId) {
          return;
        }
        const currentGameName = rooms[roomId].name;
        const currentGame = rooms[roomId].games[currentGameName];
        const games = await getUserGames(userId);
        rooms[roomId].games = { ...games, [currentGameName]: currentGame };
        console.log("Get user created boards", { userId, roomId });
        io.to(roomId).emit("gameState updated", rooms[roomId]);
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
          if (!rooms[roomId] || !rooms[roomId].games[gameName]) {
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
        ({ value: score, clueText, arrayIndex, roomId }) => {
          if (!rooms[roomId]) {
            return;
          }
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
              const clueIndex = rooms[roomId].gameBoard[
                arrayIndex
              ].clues.findIndex((clue) => clue.text === clueText);
              rooms[roomId].gameBoard[arrayIndex].clues[
                clueIndex
              ].alreadyPlayed = true;
              rooms[roomId].incorrectGuesses = [];
              rooms[roomId].isBuzzerActive = false;
              if (rooms[roomId].dailyDoubleAmount) {
                (rooms[roomId].dailyDoubleAmount as number) *= -1;
              }
            }
          } else {
            rooms[roomId].incorrectGuesses = [];
            rooms[roomId].isBuzzerActive = false;

            const clueIndex = rooms[roomId].gameBoard[
              arrayIndex
            ].clues.findIndex((clue) => clue.text === clueText);
            rooms[roomId].gameBoard[arrayIndex].clues[clueIndex].alreadyPlayed =
              true;
          }

          const updatedScore = rooms[roomId].dailyDoubleAmount || score;
          const playerThatScored =
            rooms[roomId].activePlayer || rooms[roomId].lastActivePlayer;

          // @TODO: when the player leaves after they buzz in but before they are marked correct/incorrect
          // we can't update their score. look into this
          if (playerThatScored && rooms[roomId].players[playerThatScored]) {
            rooms[roomId].players[playerThatScored].score += updatedScore;

            console.log(
              `The player ${playerThatScored} score changed: `,
              rooms[roomId].players[playerThatScored].score,
              updatedScore,
              new Date().toLocaleTimeString()
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
        if (!rooms[roomId]) {
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

      socket.on(
        "Host loads the game board for the first time",
        (gameName = "Animals", roomId) => {
          if (!rooms[roomId] || !rooms[roomId].games[gameName]) {
            return;
          }
          console.log(
            "Host loads the game board for the first time",
            gameName,
            roomId
          );
          rooms[roomId].name = gameName;
          rooms[roomId].gameBoard = rooms[roomId].games[gameName].rounds[0];
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
        if (!rooms[roomId] || !rooms[roomId].games[rooms[roomId].name]) {
          return;
        }
        console.log("Host navigates to another round, round: ", round);
        // console.log("navigate 1st round", data);
        rooms[roomId].gameBoard =
          rooms[roomId].games[rooms[roomId].name].rounds[round - 1];
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
            rooms[roomId].gameBoard[arrayIndex].clues[clueIndex]
          );

          rooms[roomId].gameBoard[arrayIndex].clues[clueIndex].alreadyPlayed =
            true;
          io.to(roomId).emit("gameState updated", rooms[roomId]);
        }
      );

      socket.on(
        "Host adds a team with a button",
        ({ playerName, keys }, roomId) => {
          if (!rooms[roomId]) {
            return;
          }
          rooms[roomId].players[playerName] = {
            name: playerName,
            socketId: playerName,
            keys,
            score: 0,
            ping: 0,
          };
          console.log("Host adds a team with a button", playerName);
          // emit to EVERYONE the update game state
          io.to(roomId).emit("gameState updated", rooms[roomId]);
        }
      );

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
          if (!rooms[roomId]) {
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

      socket.on(
        "create a new game",
        async function (previousGameName, game, roomId, userId) {
          if (!rooms[roomId] || !userId) {
            return;
          }
          try {
            const existingGame = await Game.findOne({ name: previousGameName });

            if (existingGame) {
              try {
                await updateGame(previousGameName, game);
                delete rooms[roomId].games[previousGameName];
                rooms[roomId].games[game.name] = game;
                console.log(`Updated the ${game.name} game successfully!`);
                io.to(roomId).emit("gameState updated", rooms[roomId]);
              } catch (err: any) {
                console.error(
                  `Error: There was an issue updating the ${previousGameName} game to the database...`,
                  err?.message
                );
              }
              return;
            } else {
              console.log(`Created the new ${game.name} game successfully!`);
            }

            const newGame = await createGame({
              name: game.name,
              userId: userId,
              isPublic: false,
              gameObject: game,
            });

            if (newGame) {
              rooms[roomId].games[newGame.name] = newGame.gameObject;
              io.to(roomId).emit("gameState updated", rooms[roomId]);
            }
          } catch (err: any) {
            console.error(
              "Error: There was an issue saving this game to the database...",
              err?.message
            );
          }
        }
      );

      socket.on("delete a game", function (gameFileName, roomId) {
        if (!rooms[roomId]) {
          return;
        }
        try {
          deleteGame(gameFileName);
          const updatedGames = { ...rooms[roomId].games };
          delete updatedGames[gameFileName];
          rooms[roomId].games = updatedGames;
          io.to(roomId).emit("gameState updated", rooms[roomId]);
        } catch (err) {
          console.log(
            "Error: couldn't delete game file: ",
            gameFileName + ".json",
            err
          );
        }
      });

      socket.on("Delete the player", async (roomId, socketId) => {
        if (!rooms[roomId]) {
          return;
        }

        delete rooms[roomId].players[socketId];
        io.to(roomId).emit("gameState updated", rooms[roomId]);
      });
    }
  );
}
start();
