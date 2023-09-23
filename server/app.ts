import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import fs from "fs";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import {
  ClientToServerEvents,
  GameBoard,
  GameState,
  PlayerObject,
  ServerToClientEvents,
} from "../stateTypes";
import { Server, Socket } from "socket.io";

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

app.post("/api/createGame", (req, res) => {
  const receivedData = req.body;
  console.log("Received JSON data:", receivedData);
  res.json({ message: "JSON data received successfully" });
  fs.writeFileSync(
    `./games/${receivedData.name}.json`,
    JSON.stringify(receivedData, null, 2)
  );
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

type GamesFile = {
  [key: string]: {
    name: string;
    rounds: GameBoard[][];
  };
};

const games: GamesFile = require("./games");

const io = new Server(5000, {
  cors: {
    origin: `*`,
    methods: ["GET", "POST"],
  },
  pingInterval: 10000,
  pingTimeout: 300000,
});

let previousGameId = "";

const createDefaultGameState = (
  newGameId = true,
  specificGameName?: string
): GameState => {
  const newGames = JSON.parse(JSON.stringify(games));
  const gameId = newGameId ? uuidv4() : previousGameId;
  previousGameId = gameId;
  return {
    name: specificGameName || newGames[Object.keys(newGames)[0]].name,
    games: newGames,
    guid: gameId,
    isBuzzerActive: false,
    activePlayer: null,
    lastActivePlayer: null,
    dailyDoubleAmount: 0,
    previousClue: null,
    activeClue: null,
    players: {},
    gameBoard: newGames[specificGameName || Object.keys(newGames)[0]].rounds[0],
    incorrectGuesses: [],
    history: [],
  };
};

// the game state
let gameState = createDefaultGameState();

let playersThatLeft: PlayerObject[] = [];

io.on(
  "connect",
  function (socket: Socket<ClientToServerEvents, ServerToClientEvents>) {
    // console.log("A new client has joined", socket.id);

    // new player joined
    gameState.players[socket.id] = {
      score: 0,
    };

    // emit to the newly connected client the existing count
    socket.emit("gameState updated", gameState);

    socket.on("Host restarts the game", (gameName) => {
      console.log("Host restarts the game", gameName);
      gameState = createDefaultGameState(false, gameName);
      playersThatLeft = [];
      io.emit("gameState updated", gameState);
    });

    socket.on("Host changes the game", (gameName: string) => {
      console.log("Host changes up the game", gameName);
      gameState = createDefaultGameState(false, gameName);
      playersThatLeft = [];
      io.emit("gameState updated", gameState);
    });

    socket.on("new player joined", (playerName) => {
      // emit to EVERYONE the update game state
      // console.log("hahahahaha");
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
      const returnedPlayer = playersThatLeft.find(
        (player) => player?.name && player.name === playerName
      );
      if (returnedPlayer) {
        gameState.players[socket.id] = returnedPlayer;
        socket.emit("player successfully added to game");
      } else {
        gameState.players[socket.id] = { name: "", score: 0 };
        gameState.players[socket.id].name = playerName;
        socket.emit("gameState updated", gameState);
        socket.emit("player successfully added to game");
      }
      // console.log("yo, this player signed up", gameState);
      io.emit("gameState updated", gameState);
    });

    socket.on("give updated game state", () => {
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
          gameState.gameBoard[arrayIndex].clues[clueIndex].alreadyPlayed = true;
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
        console.log("Host loads the game board for the first time");
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
      console.log("Host navigates to another round");
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
          .filter((player) => player.name)
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

    socket.on("disconnect", function () {
      // if they had a name and left, let them rejoin with old score
      if (gameState.players[socket.id]?.name) {
        playersThatLeft.push(gameState.players[socket.id]);
      }
      delete gameState.players[socket.id];
      // emit to EVERYONE the update game state
      io.emit("gameState updated", gameState);
    });
  }
);