import { Router } from "express";
import fs from "fs/promises"; // Use fs.promises for async file operations

const router = Router();

router.get("/recordings", async (_, res) => {
  try {
    const files = await fs.readdir("uploads/");

    const filePaths = files.filter((file) => !file.endsWith(".wav"));

    res.status(200).json({
      file_paths: filePaths,
    });
  } catch (error) {
    console.error("Error reading directory:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
