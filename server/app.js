// import { GameState } from "../stateTypes";
const { on } = require("nodemon");
const { data, dataRoundTwo } = require("./data");

const io = require("socket.io")(5000, {
  cors: {
    origin: "http://10.0.0.208:3000",
    methods: ["GET", "POST"],
  },
  "sync disconnect on unload": false,
});

// the game state
let gameState = {
  isBuzzerActive: false,
  activePlayer: null,
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

  socket.on("new player joined", () => {
    // emit to EVERYONE the update game state
    // console.log("hahahahaha");
    io.emit("gameState updated", gameState);
  });

  socket.on("player signed up", (playerName) => {
    console.log({ playersThatLeft });
    const returnedPlayer = playersThatLeft.find(
      (player) => player?.name && player.name === playerName
    );
    if (returnedPlayer) {
      gameState.players[socket.id] = returnedPlayer;
    } else {
      console.log("ahhhhhh", socket.id, gameState.players);
      gameState.players[socket.id].name = playerName;
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

        if (gameState.incorrectGuesses.length === activePlayers.length) {
          console.log("wtf", { arrayIndex });
          const clueIndex = gameState.gameBoard[arrayIndex].clues.findIndex(
            (clue) => clue.text === clueText
          );
          gameState.gameBoard[arrayIndex].clues[clueIndex].alreadyPlayed = true;
          gameState.incorrectGuesses = [];
          gameState.isBuzzerActive = false;
        }
      } else {
        gameState.incorrectGuesses = [];
        gameState.isBuzzerActive = false;

        const clueIndex = gameState.gameBoard[arrayIndex].clues.findIndex(
          (clue) => clue.text === clueText
        );
        gameState.gameBoard[arrayIndex].clues[clueIndex].alreadyPlayed = true;
      }
      gameState.players[gameState.activePlayer].score += score;
      gameState.activePlayer = null;
      io.emit("gameState updated", gameState);
    }
  );

  socket.on("Host selects a clue", (activeClue) => {
    gameState.activeClue = activeClue;
    io.emit("gameState updated", gameState);
  });

  socket.on("Host activates the buzzers", () => {
    gameState.isBuzzerActive = !gameState.isBuzzerActive;
    io.emit("gameState updated", gameState);
  });

  socket.on("A player hits the buzzer", () => {
    if (gameState.activePlayer) return;
    gameState.activePlayer = socket.id;
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
    if (gameState.players[socket.id]?.name) {
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
