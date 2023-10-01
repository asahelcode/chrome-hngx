import pkg from "@deepgram/sdk";
import dotEnv from "dotenv";
const { Deepgram } = pkg;
dotEnv.config();

// Your Deepgram API Key
const deepgramApiKey = process.env.DEEPGRAM_API_KEY;

// Initialize the Deepgram SDK
const deepgram = new Deepgram(deepgramApiKey);
const transciptFile = async (audio, mimetype) => {
  const source = {
    buffer: audio,
    mimetype: mimetype,
  };

  // Send the audio to Deepgram and get the response
  try {
    const response = await deepgram.transcription.preRecorded(source, {
      smart_format: true,
      model: "nova",
    });
    return response.results;
  } catch (error) {
    console.log(error);
  }
};

export default transciptFile;
