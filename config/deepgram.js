import pkg from "@deepgram/sdk";
import dotenv from "dotenv";

dotenv.config();

const { Deepgram } = pkg;

const deepgram = new Deepgram(process.env.DEEPGRAM_API_KEY);

export default deepgram;
