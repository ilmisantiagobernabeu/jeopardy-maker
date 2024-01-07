import express from "express";
import cors from "cors";
import multer from "multer";
import crypto from "crypto";
import sharp from "sharp";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { AWS_BUCKET_NAME, s3 } from "./constants";
import {
  Game,
  createGame,
  deleteGame,
  getPublicGames,
  getUserGames,
  updateGame,
} from "./models/game";
import { sendEmail } from "./utilities";
import { rooms } from "./rooms";
import { io } from "./io";

const storage = multer.memoryStorage();
const upload = multer({ storage });

const app = express();

app.use(cors());
// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/api/uploadImage", upload.single("image"), async (req, res) => {
  // resize image
  try {
    const buffer = await sharp(req.file?.buffer)
      .resize({
        width: 1920,
        height: 1080,
        fit: "inside",
        withoutEnlargement: true,
      })
      .toBuffer();

    const imageName = crypto.randomBytes(32).toString("hex");
    console.log(
      "uploaded image file:",
      imageName,
      req?.file?.buffer
        ? `${(req.file.buffer.length / (1024 * 1024)).toFixed(2)}MB`
        : null
    );

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

app.post("/api/uploadAudio", upload.single("mp3"), async (req, res) => {
  const audioName = crypto.randomBytes(32).toString("hex");

  console.log(
    "uploaded audio file:",
    audioName,
    req?.file?.buffer
      ? `${(req.file.buffer.length / (1024 * 1024)).toFixed(2)}MB`
      : null
  );
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

app.get("/api/getPrivateBoards", async (req, res) => {
  const games = await getPublicGames({ isPublic: false });

  res.send(games);
});

app.post("/api/contact", async (req, res) => {
  const { email, body } = req.body;
  sendEmail(email, body);

  res.status(200).send("Success");
});

app.get("/api/getUserBoards", async (req, res) => {
  const {
    query: { userId },
  } = req;

  const games = userId
    ? await getUserGames(userId.toString())
    : await getPublicGames();

  console.log("Get user created boards", { userId });

  res.send(games);
});

app.get("/api/getGameboard/:roomId/:gameName", async (req, res) => {
  const {
    params: { gameName, roomId },
  } = req;

  if (!roomId || !rooms[roomId]) {
    return res.status(404).json({ error: "Data not found" });
  }

  // prevents us from restarting the state of the game if we pick
  // the current game we already have going
  if (
    rooms[roomId].name === gameName &&
    rooms[roomId].game.rounds.some((round) =>
      round.some((r) => r.clues.some((clue) => clue.alreadyPlayed))
    )
  ) {
    return res.status(200).send("Game already in state!");
  }

  console.log("Host loads the game board for the first time", gameName, roomId);

  const game = await Game.findOne({ name: gameName });
  rooms[roomId].name = gameName;
  rooms[roomId].game = game?.gameObject || {};
  io.to(roomId).emit("gameState updated", rooms[roomId]);

  return res.status(200).send("Success");
});

app.delete("/api/deleteUserBoard/:gameName", async (req, res) => {
  const {
    params: { gameName },
  } = req;

  try {
    deleteGame(gameName);
  } catch (err) {
    console.error("Error: couldn't delete the game: ", gameName, err);
  }

  res.send("success");
});

app.post("/api/createNewBoard", async (req, res) => {
  const { userId, previousGameName, game, clueType } = req.body;

  if (!userId) {
    return res.status(404).json({ error: "Data not found" });
  }
  try {
    const existingGame = await Game.findOne({ name: previousGameName });

    if (existingGame) {
      try {
        await updateGame(previousGameName, game);
        console.log(`Updated the ${game.name} game successfully!`, clueType);
      } catch (err: any) {
        console.error(
          `Error: There was an issue updating the ${previousGameName} game to the database...`,
          err?.message
        );
      }
      return res.send("Updated board successfully");
    }

    console.log(`Created the new ${game.name} game successfully!`);

    await createGame({
      name: game.name,
      userId: userId,
      isPublic: false,
      gameObject: game,
    });

    return res.send("Created board successfully");
  } catch (err: any) {
    console.error(
      "Error: There was an issue saving this game to the database...",
      err?.message
    );
    return res.status(404).json({
      error: `Error: There was an issue saving this game to the database...${err?.message}`,
    });
  }
});

export default app;
