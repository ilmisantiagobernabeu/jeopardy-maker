import express from "express";
import cors from "cors";
import multer from "multer";
import crypto from "crypto";
import sharp from "sharp";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { AWS_BUCKET_NAME, s3 } from "./constants";
import { getPublicGames, getUserGames } from "./models/game";

const storage = multer.memoryStorage();
const upload = multer({ storage });

const app = express();

app.use(cors());

app.post("/api/uploadImage", upload.single("image"), async (req, res) => {
  // resize image
  try {
    const buffer = await sharp(req.file?.buffer)
      .resize({
        width: 1920,
        height: 1080,
        withoutEnlargement: true,
      })
      .toBuffer();

    const imageName = crypto.randomBytes(32).toString("hex");

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

  console.log("audio file:", audioName);
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

// app.get("/api/getUserBoards/:userId", async (req, res) => {
//   const {params: {userId}} = req;
//   const games = await getUserGames(userId)

//   res.send(games)
// })

export default app;
