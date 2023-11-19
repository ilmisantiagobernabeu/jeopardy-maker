import fs from "fs";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import {
  ClientToServerEvents,
  GameState,
  PlayerObject,
  Players,
  ServerToClientEvents,
} from "../stateTypes";
import { Server, Socket } from "socket.io";
import express from "express";
import cors from "cors";
import multer from "multer";
import crypto from "crypto";
import sharp from "sharp";
dotenv.config();

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const storage = multer.memoryStorage();
const upload = multer({ storage });

const expApp = express();

expApp.use(cors());

expApp.post("/api/uploadImage", upload.single("image"), async (req, res) => {
  // resize image
  try {
    const buffer = await sharp(req.file?.buffer)
      .resize({
        width: 1920,
        height: 1080,
        withoutEnlargement: true,
      })
      .toBuffer();

    const imageName = `${req.file?.originalname}-${crypto
      .randomBytes(32)
      .toString("hex")}`;

    const params = {
      Bucket: AWS_BUCKET_NAME,
      Key: imageName,
      Body: buffer,
      ContentType: req.file?.mimetype,
    };

    const command = new PutObjectCommand(params);
    await s3.send(command);

    res.send(imageName);
  } catch (err) {
    console.log("oh no could not resize!!!!!", err);
  }
});

expApp.post("/api/uploadAudio", upload.single("mp3"), async (req, res) => {
  const audioName = `${req.file?.originalname}-${crypto
    .randomBytes(32)
    .toString("hex")}`;

  console.log("audio file:", req?.file?.buffer);
  if (req?.file?.buffer) {
    const params = {
      Bucket: AWS_BUCKET_NAME,
      Key: audioName,
      Body: req.file.buffer,
      ContentType: "audio/mpeg",
    };

    const command = new PutObjectCommand(params);

    try {
      await s3.send(command);
    } catch (error) {
      // Failed upload
      console.error("Error uploading audio file:", error);
      res.status(500).json({ error: "Failed to upload audio file to S3" });
    }
  }

  res.send(audioName);
});

// Start the server
expApp.listen(5001, () => {
  console.log(`Server is listening on port ${5001}`);
});

const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME ?? "";
const AWS_BUCKET_REGION = process.env.AWS_BUCKET_REGION ?? "";
const AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY ?? "";
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY ?? "";

const s3 = new S3Client({
  credentials: {
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
  region: AWS_BUCKET_REGION,
});

const {
  getPublicGames,
  createGame,
  Game,
  updateGame,
  deleteGame,
} = require("./models/game");

import mongoose from "mongoose";

const io = new Server(5000, {
  cors: {
    origin: `*`,
    methods: ["GET", "POST"],
  },
  pingInterval: 10000,
  pingTimeout: 300000,
});

async function app() {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log("Connected to MongoDB...");
  } catch (err) {
    console.error("Failed to connect to MongoDB...", err);
  }

  let previousGameId = "";

  const createDefaultGameState = async (
    newGameId = true,
    specificGameName?: string,
    previousPlayers?: Players | undefined
  ): Promise<GameState> => {
    const publicGames = await getPublicGames();

    const gameId = newGameId ? uuidv4() : previousGameId;
    previousGameId = gameId;
    const previousPlayersWithoutScores: Players = Object.fromEntries(
      Object.entries(previousPlayers || {}).map(([guid, player]) => [
        guid,
        {
          ...player,
          score: 0,
        },
      ])
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
      players: previousPlayersWithoutScores || {},
      gameBoard:
        publicGames[specificGameName || Object.keys(publicGames)[0]].rounds[0],
      incorrectGuesses: [],
      history: [],
    };
  };

  // the game state
  let gameState = await createDefaultGameState();

  let playersThatLeft: PlayerObject[] = [];

  io.on(
    "connect",
    function (socket: Socket<ClientToServerEvents, ServerToClientEvents>) {
      // console.log("A new client has joined", socket.id);

      // emit to the newly connected client the existing count
      socket.emit("gameState updated", gameState);

      socket.on("Host restarts the game", async (gameName) => {
        console.log("Host restarts the game", gameName);
        gameState = await createDefaultGameState(false, gameName);
        playersThatLeft = [];
        io.emit("gameState updated", gameState);
      });

      socket.on(
        "Host changes the game",
        async (gameName: string, players: Players | undefined) => {
          console.log("Host changes up the game", gameName);
          gameState = await createDefaultGameState(false, gameName, players);
          playersThatLeft = [];
          io.emit("gameState updated", gameState);
        }
      );

      socket.on("new player joined", (playerName) => {
        // emit to EVERYONE the update game state
        const returnedPlayer = playersThatLeft.find(
          (player) => player?.name && player.name === playerName
        );
        if (returnedPlayer) {
          gameState.players[socket.id] = returnedPlayer;
          io.emit("existing player returned");
        }
        io.emit("gameState updated", gameState);
      });

      socket.on("player signed up", (playerName) => {
        console.log("A player has joined", playerName);
        const returnedPlayer = playersThatLeft.find(
          (player) => player?.name && player.name === playerName
        );
        if (returnedPlayer) {
          gameState.players[socket.id] = returnedPlayer;
          socket.emit("player successfully added to game");
        } else {
          gameState.players[socket.id] = {
            name: "",
            socketId: socket.id,
            score: 0,
          };
          gameState.players[socket.id].name = playerName;
          socket.emit("gameState updated", gameState);
          socket.emit("player successfully added to game");
        }
        io.emit("gameState updated", gameState);
      });

      socket.on(
        "A player answers the clue",
        ({ value: score, clueText, arrayIndex }) => {
          if (score < 0) {
            if (gameState.activePlayer) {
              gameState.incorrectGuesses.push(gameState.activePlayer);
            }
            gameState.isBuzzerActive = true;

            const activePlayers = Object.values(gameState.players).filter(
              (x) => x.name
            );

            if (
              gameState.incorrectGuesses.length === activePlayers.length ||
              gameState.dailyDoubleAmount
            ) {
              const clueIndex = gameState.gameBoard[arrayIndex].clues.findIndex(
                (clue) => clue.text === clueText
              );
              gameState.gameBoard[arrayIndex].clues[clueIndex].alreadyPlayed =
                true;
              gameState.incorrectGuesses = [];
              gameState.isBuzzerActive = false;
              if (gameState.dailyDoubleAmount) {
                gameState.dailyDoubleAmount *= -1;
              }
            }
          } else {
            gameState.incorrectGuesses = [];
            gameState.isBuzzerActive = false;

            const clueIndex = gameState.gameBoard[arrayIndex].clues.findIndex(
              (clue) => clue.text === clueText
            );
            gameState.gameBoard[arrayIndex].clues[clueIndex].alreadyPlayed =
              true;
          }

          const updatedScore = gameState.dailyDoubleAmount || score;
          const playerThatScored =
            gameState.activePlayer || gameState.lastActivePlayer;

          gameState.players[playerThatScored!].score += updatedScore;

          const player = gameState.players[playerThatScored!];

          gameState.history.push({
            ...player,
            name: player.name || "N/A",
            socket: playerThatScored || "N/A",
            score: updatedScore,
            totalScore: player.score,
            answer: updatedScore > 0 ? "correct" : "incorrect",
            timeStamp: new Date(),
          });
          gameState.dailyDoubleAmount = 0;
          gameState.activePlayer = null;
          io.emit("gameState updated", gameState);
        }
      );

      socket.on("Host modifies the score", (player) => {
        gameState.players[player.socket].score += player.score;
        gameState.history.push({
          name: player.name,
          score: player.score,
          totalScore: gameState.players[player.socket].score,
          answer: player.score > 0 ? "correct" : "incorrect",
          timeStamp: new Date(),
          socket: player.socket,
        });
        io.emit("gameState updated", gameState);
      });

      socket.on("Host selects a clue", (activeClue) => {
        gameState.previousClue = gameState.activeClue;
        gameState.activeClue = activeClue;
        io.emit("gameState updated", gameState);
      });

      socket.on("Host deselects a clue", () => {
        gameState.isBuzzerActive = false;
        gameState.activeClue = gameState.previousClue;
        io.emit("gameState updated", gameState);
      });

      socket.on(
        "A player sets daily double wager",
        ({ dailyDoubleAmount, clueText, arrayIndex }) => {
          gameState.dailyDoubleAmount = dailyDoubleAmount;
        }
      );

      socket.on(
        "Host loads the game board for the first time",
        (gameName = "steveo") => {
          console.log("Host loads the game board for the first time", gameName);
          gameState.name = gameName;
          gameState.gameBoard = gameState.games[gameName].rounds[0];
          io.emit("gameState updated", gameState);
        }
      );

      socket.on("Host activates the buzzers", () => {
        gameState.isBuzzerActive = !gameState.isBuzzerActive;
        io.emit("gameState updated", gameState);
      });

      socket.on("A player hits the buzzer", () => {
        if (gameState.activePlayer) return;
        gameState.activePlayer = socket.id;
        gameState.lastActivePlayer = socket.id;
        gameState.isBuzzerActive = false;
        io.emit("gameState updated", gameState);
      });

      socket.on("A player with a button hits the buzzer", (color) => {
        if (gameState.activePlayer) return;
        gameState.activePlayer = color;
        gameState.lastActivePlayer = color;
        gameState.isBuzzerActive = false;
        io.emit("gameState updated", gameState);
      });

      socket.on("Host navigates to another round", (round) => {
        console.log("Host navigates to another round, round: ", round);
        // console.log("navigate 1st round", data);
        gameState.gameBoard = gameState.games[gameState.name].rounds[round - 1];
        io.emit("gameState updated", gameState);
      });

      socket.on("No player knows the answer", ({ clueText, arrayIndex }) => {
        gameState.incorrectGuesses = [];
        gameState.isBuzzerActive = false;
        const clueIndex = gameState.gameBoard[arrayIndex].clues.findIndex(
          (clue) => clue.text === clueText
        );
        gameState.gameBoard[arrayIndex].clues[clueIndex].alreadyPlayed = true;
        io.emit("gameState updated", gameState);
      });

      socket.on("a player disconnected", () => {
        // if they had a name and a score (>0) and left, let them rejoin with old score
        if (
          gameState.players[socket.id]?.name &&
          gameState.players[socket.id]?.score &&
          !playersThatLeft
            .map((player) => player.name)
            .includes(gameState.players[socket.id]?.name)
        ) {
          playersThatLeft.push(gameState.players[socket.id]);
        }
        delete gameState.players[socket.id];
        // emit to EVERYONE the update game state
        io.emit("gameState updated", gameState);
      });

      socket.on("Host adds a team with a button", ({ playerName, color }) => {
        gameState.players[color] = {
          name: playerName,
          socketId: color,
          color,
          score: 0,
        };
        // emit to EVERYONE the update game state
        io.emit("gameState updated", gameState);
      });

      socket.on("Team selects a daily double clue", () => {
        if (!gameState.lastActivePlayer) {
          const firstPlayer =
            Object.entries(gameState.players || {}).find(
              ([_, player]) => player.name
            )?.[0] || null;
          gameState.lastActivePlayer = firstPlayer;
        }
        io.emit("gameState updated", gameState);
      });

      socket.on("update player score manually", (socketId, newScore) => {
        const oldScore = gameState.players[socketId].score;
        const diff = newScore - oldScore;
        gameState.players[socketId].score = newScore;

        const player = gameState.players[socketId];
        gameState.history.push({
          name: player.name || "",
          score: diff,
          totalScore: gameState.players[player.socketId].score,
          answer: diff > 0 ? "correct" : "incorrect",
          timeStamp: new Date(),
          socket: player.socketId,
        });
        // emit to EVERYONE the update game state
        io.emit("gameState updated", gameState);
      });

      socket.on("disconnect", function () {
        // if they had a name and left, let them rejoin with old score
        if (gameState.players[socket.id]?.name) {
          playersThatLeft.push(gameState.players[socket.id]);
        }
        delete gameState.players[socket.id];
        // emit to EVERYONE the update game state
        io.emit("gameState updated", gameState);
      });

      socket.on("create a new game", async function (game) {
        try {
          const existingGame = await Game.findOne({ name: game.name });

          if (existingGame) {
            try {
              const editedGame = await updateGame(game);
              gameState.games[game.name] = game;
              console.log(
                `Updated the ${game.name} game successfully!`,
                editedGame
              );
              io.emit("gameState updated", gameState);
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
            isPublic: true,
            gameObject: game,
          });
          gameState.games[newGame.name] = newGame.gameObject;
          io.emit("gameState updated", gameState);
        } catch (err: any) {
          console.error(
            "Error: There was an issue saving this game to the database...",
            err?.message
          );
        }
      });

      socket.on("delete a game", function (gameFileName) {
        try {
          deleteGame(gameFileName);
          const updatedGames = { ...gameState.games };
          delete updatedGames[gameFileName];
          gameState.games = updatedGames;
          io.emit("gameState updated", gameState);
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
app();
