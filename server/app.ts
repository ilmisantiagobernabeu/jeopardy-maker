import dotenv from "dotenv";
dotenv.config();
import { v4 as uuidv4 } from "uuid";
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
    await mongoose.connect(process.env.MONGO_URI!);
    console.log("Connected to MongoDB...");
  } catch (err) {
    console.error("Failed to connect to MongoDB...", err);
  }

  const createDefaultGameState = async ({
    previousRoomId = "",
    specificGameName,
    previousPlayers,
    userId,
  }: Partial<{
    previousRoomId: string;
    specificGameName?: string;
    previousPlayers?: Players | undefined;
    userId?: string;
  }> = {}): Promise<GameState> => {
    const publicGames = userId
      ? await getUserGames(userId)
      : await getPublicGames();

    const gameId = previousRoomId || uuidv4().slice(0, 5);

    const previousPlayersWithoutScores: Players = Object.fromEntries(
      Object.entries(previousPlayers || {}).map(([guid, player]) => [
        guid,
        {
          ...player,
          score: 0,
        },
      ])
    );

    console.log(
      "why you do this",
      Object.keys(publicGames),
      specificGameName,
      Object.keys(publicGames)[0]
    );

    return {
      name: specificGameName || publicGames[Object.keys(publicGames)[0]].name,
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
      gameBoard:
        publicGames[specificGameName || Object.keys(publicGames)[0]].rounds[0],
      incorrectGuesses: [],
      history: [],
      timer: null,
      firstPlayerToBuzzIn: null,
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
      socket.on("Host reloads the board page", (roomId) => {
        if (!rooms[roomId]) {
          return;
        }
        socket.join(roomId);
        console.log("Host reloads the board page", roomId);
        socket.emit("gameState updated", rooms[roomId]);
      });

      socket.on("Get user created boards", async (roomId, userId) => {
        if (!roomId && !rooms[roomId] && !userId) {
          return;
        }
        const games = await createDefaultGameState({
          previousRoomId: roomId,
          userId,
        });
        rooms[roomId] = games;
        console.log("Get user created boards", { userId, roomId });
        io.to(roomId).emit("gameState updated", rooms[roomId]);
      });

      socket.on("Host visits the homepage", async () => {
        const gameState = await createDefaultGameState();
        const roomId = gameState.guid;
        rooms[roomId] = gameState;
        socket.join(roomId);
        console.log("Host visits the homepage", roomId, Object.keys(rooms));
        io.to(roomId).emit("gameState updated", rooms[roomId]);
      });

      socket.on("Host restarts the game", async (gameName, roomId, userId) => {
        if (!rooms[roomId]) {
          return;
        }
        console.log("Host restarts the game", roomId, gameName);
        rooms[roomId] = await createDefaultGameState({
          previousRoomId: roomId,
          specificGameName: gameName,
          userId,
        });
        rooms[roomId].playersThatLeft = [];
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
          if (!rooms[roomId]) {
            return;
          }
          console.log("Host changes up the game", gameName, roomId, userId);
          rooms[roomId] = await createDefaultGameState({
            userId,
            previousRoomId: roomId,
            specificGameName: gameName,
            previousPlayers: players,
          });
          rooms[roomId].playersThatLeft = [];
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
        if (returnedPlayer) {
          rooms[roomId].players[socket.id] = returnedPlayer;
          socket.emit("player successfully added to game");
        } else {
          rooms[roomId].players[socket.id] = {
            name: "",
            socketId: socket.id,
            score: 0,
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

          rooms[roomId].players[playerThatScored!].score += updatedScore;

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
        (gameName = "steveo", roomId) => {
          if (!rooms[roomId]) {
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
        rooms[roomId].isBuzzerActive = !rooms[roomId].isBuzzerActive;
        io.to(roomId).emit("gameState updated", rooms[roomId]);
      });

      socket.on("A player hits the buzzer", (roomId, timestamp) => {
        if (!rooms[roomId]) {
          return;
        }
        if (rooms[roomId].activePlayer) return;

        if (rooms[roomId].firstPlayerToBuzzIn === null) {
          // If no player has clicked the button yet, consider the current player as the first
          rooms[roomId].firstPlayerToBuzzIn = {
            socketId: socket.id,
            timestamp: timestamp,
          };

          // Start a half-second timer
          rooms[roomId].timer = setTimeout(() => {
            console.log(
              "Time is up! First player:",
              rooms[roomId].firstPlayerToBuzzIn
            );
            rooms[roomId].activePlayer =
              rooms[roomId].firstPlayerToBuzzIn?.socketId || "";
            rooms[roomId].lastActivePlayer =
              rooms[roomId].firstPlayerToBuzzIn?.socketId || "";
            rooms[roomId].isBuzzerActive = false;
            // Reset variables for the next round
            rooms[roomId].firstPlayerToBuzzIn = null;
            rooms[roomId].timer = null;

            io.to(roomId).emit("gameState updated", rooms[roomId]);
          }, 500);
        } else if (
          timestamp < (rooms[roomId].firstPlayerToBuzzIn?.timestamp || Infinity)
        ) {
          rooms[roomId].firstPlayerToBuzzIn = {
            socketId: socket.id,
            timestamp: timestamp,
          };
        }
      });

      socket.on("A player with a button hits the buzzer", (color, roomId) => {
        if (!rooms[roomId]) {
          return;
        }
        if (rooms[roomId].activePlayer) return;
        rooms[roomId].activePlayer = color;
        rooms[roomId].lastActivePlayer = color;
        rooms[roomId].isBuzzerActive = false;
        io.to(roomId).emit("gameState updated", rooms[roomId]);
      });

      socket.on("Host navigates to another round", (round, roomId) => {
        if (!rooms[roomId]) {
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
        ({ clueText, arrayIndex }, roomId) => {
          if (!rooms[roomId]) {
            return;
          }
          rooms[roomId].incorrectGuesses = [];
          rooms[roomId].isBuzzerActive = false;
          const clueIndex = rooms[roomId].gameBoard[arrayIndex].clues.findIndex(
            (clue) => clue.text === clueText
          );
          rooms[roomId].gameBoard[arrayIndex].clues[clueIndex].alreadyPlayed =
            true;
          io.to(roomId).emit("gameState updated", rooms[roomId]);
        }
      );

      socket.on(
        "Host adds a team with a button",
        ({ playerName, color }, roomId) => {
          if (!rooms[roomId]) {
            return;
          }
          rooms[roomId].players[color] = {
            name: playerName,
            socketId: color,
            color,
            score: 0,
          };
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
        if (rooms[roomId].players?.[socket.id]?.name) {
          rooms[roomId].playersThatLeft.push(rooms[roomId].players[socket.id]);
        }
        delete rooms[roomId].players[socket.id];
        // emit to EVERYONE the update game state
        io.to(roomId).emit("gameState updated", rooms[roomId]);
      });

      socket.on("create a new game", async function (game, roomId, userId) {
        if (!rooms[roomId] && !userId) {
          return;
        }
        try {
          const existingGame = await Game.findOne({ name: game.name });

          if (existingGame) {
            try {
              const editedGame = await updateGame(game);
              rooms[roomId].games[game.name] = game;
              console.log(
                `Updated the ${game.name} game successfully!`,
                editedGame
              );
              io.to(roomId).emit("gameState updated", rooms[roomId]);
            } catch (err: any) {
              console.error(
                "Error: There was an issue updating this game to the database...",
                err?.message
              );
            }
            return;
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
      });

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
    }
  );
}
start();
