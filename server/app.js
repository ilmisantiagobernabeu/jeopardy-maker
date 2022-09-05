// import { GameState } from "../stateTypes";
const { data } = require("./data");

const io = require("socket.io")(5000, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
  "sync disconnect on unload": true,
});

// the game state
let gameState = {
  isBuzzerActive: false,
  activePlayer: null,
  players: {},
  gameBoard: data,
  incorrectGuesses: [],
};

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

  socket.on("a player disconnected", () => {
    // emit to EVERYONE the update game state
    // console.log("wtfwtfwtf player left!!!", socket.id);
    delete gameState.players[socket.id];
    io.emit("gameState updated", gameState);
  });

  socket.on("player signed up", (playerName) => {
    gameState.players[socket.id].name = playerName;
    // console.log("yo, this player signed up", gameState);
    io.emit("gameState updated", gameState);
  });

  socket.on("give updated game state", () => {
    // console.log("wtfwtfwtf");
    io.emit("gameState updated", gameState);
  });

  socket.on("A player answers the clue", ({ value: score, clueText }) => {
    if (score < 0) {
      gameState.incorrectGuesses.push(gameState.activePlayer);
      gameState.isBuzzerActive = true;
    } else {
      gameState.incorrectGuesses = [];
      gameState.isBuzzerActive = false;
      // gameState.gameBoardclueText
    }
    gameState.players[gameState.activePlayer].score += score;
    gameState.activePlayer = null;
    io.emit("gameState updated", gameState);
  });

  socket.on("Host activates the buzzers", () => {
    gameState.isBuzzerActive = !gameState.isBuzzerActive;
    io.emit("gameState updated", gameState);
  });

  socket.on("A player hits the buzzer", () => {
    gameState.activePlayer = socket.id;
    gameState.isBuzzerActive = false;
    console.log("players hits the buzzer", gameState);
    io.emit("gameState updated", gameState);
  });

  socket.on("disconnect", function () {
    console.log(socket.id + " disconnected!");
    // emit to EVERYONE the update game state
    delete gameState.players[socket.id];
    io.emit("gameState updated", gameState);
  });
});
