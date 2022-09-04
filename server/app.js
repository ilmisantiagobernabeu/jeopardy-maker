// import { GameState } from "../stateTypes";

const io = require("socket.io")(5000, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
  "sync disconnect on unload": true,
});

// the game state
let gameState = {};

io.on("connect", function (socket) {
  console.log("A new client has joined", socket.id);

  // new player joined
  gameState[socket.id] = {};
  gameState[socket.id].count = 0;

  // emit to the newly connected client the existing count
  socket.emit("gameState updated", gameState);

  // we listen for this event from the clients
  socket.on("counter clicked", (socketId) => {
    gameState[socketId].count += 1;
    console.log("clicked!", socketId, gameState);

    // emit to EVERYONE the update game state
    io.emit("gameState updated", gameState);
  });

  socket.on("new player joined", () => {
    // emit to EVERYONE the update game state
    io.emit("gameState updated", gameState);
  });

  socket.on("a player disconnected", () => {
    // emit to EVERYONE the update game state
    console.log("wtfwtfwtf player left!!!", socket.id);
    delete gameState[socket.id];
    io.emit("gameState updated", gameState);
  });

  socket.on("disconnect", function () {
    console.log(socket.id + " disconnected!");
    // emit to EVERYONE the update game state
    delete gameState[socket.id];
    io.emit("gameState updated", gameState);
  });
});
