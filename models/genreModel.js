import mongoose from "mongoose";

const Schema = mongoose.Schema;

const genreSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Genre is required"],
      unique: [true, "Genre already exists"],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Genre", genreSchema);
