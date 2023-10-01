import http from "http";
import express from "express";
import { createReadStream, createWriteStream, unlink } from "fs";
import dotEnv from "dotenv";
import cors from "cors";
import ffprobeins from "@ffprobe-installer/ffprobe";
import ffmpegins from "@ffmpeg-installer/ffmpeg";
import Ffmpeg from "fluent-ffmpeg";
import { connectDB } from "./configs/dbConfig.js";
import Video from "./models/video.js";
import path from "path";
import { fileURLToPath } from "url";
import transciptFile from "./configs/deepgram.js";

dotEnv.config();

// Setting up video converter
Ffmpeg.setFfmpegPath(ffmpegins.path);
Ffmpeg.setFfprobePath(ffprobeins.path);

// To display readme
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Setup the server
const app = express();
const server = http.createServer(app);

// Middlewares
app.use(cors());
app.use(express.static("public"));
app.use(express.json());

// Folder paths for storing videos and audios locally
const videosFolder = path.join(__dirname, "videos");
const audiosFolder = path.join(__dirname, "audios");

// Ensure the folders exist
if (!fs.existsSync(videosFolder)) {
  fs.mkdirSync(videosFolder, { recursive: true });
}

if (!fs.existsSync(audiosFolder)) {
  fs.mkdirSync(audiosFolder, { recursive: true });
}

// Array to store video chunks
const videoChunksMap = new Map();

// Endpoint to receive video chunks
app.post("/upload-video-chunk/:id", async (req, res) => {
  const id = req.params.id;

  // Check if the video ID exists in the map
  if (!videoChunksMap.has(id)) {
    videoChunksMap.set(id, []);
  }

  // Append the received chunk to the videoChunks array
  const videoChunks = videoChunksMap.get(id);
  videoChunks.push(req.body);

  // Respond with a success message
  res.json({ message: "Chunk received." });
});

// Endpoint to finalize video processing
app.post("/finalize-video/:id", async (req, res) => {
  const id = req.params.id;

  // Check if the video ID exists in the map
  if (!videoChunksMap.has(id)) {
    return res.status(400).json({ message: "Video not found." });
  }

  // Combine and process video chunks here
  const videoData = videoChunksMap.get(id);
  // Process the video chunks and save the result

  // Clean up by deleting the video chunks from the map
  videoChunksMap.delete(id);

  // Transcribe the audio using Deepgram
  const localAudFilePath = path.join(audiosFolder, `${id}.mp3`);

  // get transcription from deepgram
  const transcript = await transciptFile(
    createReadStream(localAudFilePath),
    "mp3"
  );
  if (transcript) {
    // update newData
    videoData.transcipt = JSON.stringify(transcript);
    await videoData.save();

    // delete local audio file
    unlink(localAudFilePath, (err) => {
      if (err) console.log(err);
      else console.log(localAudFilePath, "deleted");
    });
  }

  // Respond with a success message
  res.json({ message: "Video processing complete." });
});

// API routes
app.get("/api/videos/:id", async (req, res) => {
  const id = req.params.id;
  const vidData = await Video.findById(id);
  console.log(vidData);
  if (!vidData) return res.status(404).json({ mssg: "file not found" });

  // Adjust this part to serve the video file locally
  const localVideoFilePath = path.join(videosFolder, `${id}.webm`);
  res.sendFile(localVideoFilePath);
});

app.get("/api/videos/:id/stream", async (req, res) => {
  const id = req.params.id;

  // Adjust this part to serve the video stream from the file
  const localVideoFilePath = path.join(videosFolder, `${id}.webm`);
  const videoStream = createReadStream(localVideoFilePath);

  // Set appropriate headers for video streaming
  res.setHeader("Content-Type", "video/webm");
  videoStream.pipe(res);
});

app.delete("/api/videos/:id", async (req, res) => {
  const id = req.params.id;
  const vidData = await Video.findByIdAndDelete(id);
  if (!vidData) return res.status(404).json({ mssg: "file not found" });

  // Adjust this part to delete the video file locally
  const localVideoFilePath = path.join(videosFolder, `${id}.webm`);
  fs.unlinkSync(localVideoFilePath);

  res.status(200).json({ mssg: `video with id ${id} deleted` });
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/README.md");
});

// Starting server logic
const start = async () => {
  await connectDB(process.env.MONGO_URI);
  server.listen(process.env.PORT || 3000, () => {
    console.log("listening on port 3000");
  });
};

start();
