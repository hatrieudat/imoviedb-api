import mongoose from "mongoose";

const Schema = mongoose.Schema;

const commentSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    default: "",
  },
  movie_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Movie",
  },
  text: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Comment", commentSchema);
