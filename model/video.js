import { model, Schema } from "mongoose";

const videoSchema = new Schema(
  {
    transcipt: {
      type: String,
      default: "",
    },
    created: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default model("Video", videoSchema);
