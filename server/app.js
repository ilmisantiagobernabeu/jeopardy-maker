// import { GameState } from "../stateTypes";
const { on } = require("nodemon");
const { data, dataRoundTwo } = require("./data");
const fs = require("fs");
const { formatCSVToJSON } = require("./convert");

const { networkInterfaces } = require("os");
const nets = networkInterfaces();

const localIP = "192.168.0.18";

const io = require("socket.io")(5000, {
  cors: {
    origin: `http://${localIP}:3000`,
    methods: ["GET", "POST"],
  },
  pingTimeout: 300000,
  "sync disconnect on unload": false,
});

// const data = formatCSVToJSON("example.csv")

// the game state
let gameState = {
  isBuzzerActive: false,
  activePlayer: null,
  lastActivePlayer: null,
  dailyDoubleAmount: 0,
  activeClue: null,
  players: {},
  gameBoard: data,
  incorrectGuesses: [],
};

const rounds = [data, dataRoundTwo];

const playersThatLeft = [];

io.on("connect", function (socket) {
  console.log("A new client has joined", socket.id);

  // new player joined
  gameState.players[socket.id] = {};
  gameState.players[socket.id].count = 0;
  gameState.players[socket.id].score = 0;

  // emit to the newly connected client the existing count
  socket.emit("gameState updated", gameState);

  // we listen for this event from the clients
  socket.on("counter clicked", (socketId) => {
    gameState.players[socketId].count += 1;
    // console.log("clicked!", socketId, gameState);

    // emit to EVERYONE the update game state
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
      if (returnedPlayer.score > 0) {
        io.emit("existing player returned");
      }
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
    // console.log("wtfwtfwtf");
    io.emit("gameState updated", gameState);
  });

  socket.on(
    "A player answers the clue",
    ({ value: score, clueText, arrayIndex }) => {
      if (score < 0) {
        gameState.incorrectGuesses.push(gameState.activePlayer);
        gameState.isBuzzerActive = true;

        const activePlayers = Object.values(gameState.players).filter(
          (x) => x.name
        );

        if (
          gameState.incorrectGuesses.length === activePlayers.length ||
          gameState.dailyDoubleAmount
        ) {
          console.log("wtf", { arrayIndex });
          const clueIndex = gameState.gameBoard[arrayIndex].clues.findIndex(
            (clue) => clue.text === clueText
          );
          gameState.gameBoard[arrayIndex].clues[clueIndex].alreadyPlayed = true;
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

      // Give the score to the active player, otherwise the last active player (if daily double)
      // otherwise, give it to the first team to join the game, they'll go first
      const firstActivePlayer = Object.keys(gameState.players).find(
        (playerId) => gameState.players[playerId]?.name
      );
      console.log("what the heck", firstActivePlayer);
      gameState.players[
        gameState.activePlayer ||
          gameState.lastActivePlayer ||
          firstActivePlayer
      ].score += gameState.dailyDoubleAmount || score;
      gameState.dailyDoubleAmount = 0;
      gameState.activePlayer = null;
      io.emit("gameState updated", gameState);
    }
  );

  socket.on("Host selects a clue", (activeClue) => {
    gameState.activeClue = activeClue;
    io.emit("gameState updated", gameState);
  });

  socket.on(
    "A player sets daily double wager",
    ({ dailyDoubleAmount, clueText, arrayIndex }) => {
      gameState.dailyDoubleAmount = dailyDoubleAmount;
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

  socket.on("Host navigates to another round", (round) => {
    console.log("navigate 1st round", data);
    gameState.gameBoard = rounds[round - 1];
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
    // if they had a name and left, let them rejoin with old score
    if (
      gameState.players[socket.id]?.name &&
      !playersThatLeft.includes(gameState.players[socket.id]?.name)
    ) {
      playersThatLeft.push(gameState.players[socket.id]);
    }
    delete gameState.players[socket.id];
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
});
