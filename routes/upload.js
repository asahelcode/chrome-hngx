import { Router } from "express";
import multer from "multer";
import transcription from "../helpers/transcribe.js";

const router = Router();

const uploadMiddleware = multer({ dest: "uploads/" });

router.post("/upload", uploadMiddleware.single("video"), async (req, res) => {
  const trans = await transcription(req.file.path);

  // trim the uploads/ from the path
  const path = req.file.path.slice(8);

  res.status(200).json({ video_path: path, transcription: trans });
});

export default router;
