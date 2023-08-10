// Define auth model schema
import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
  },
  refresh_token: {
    type: String,
    required: true,
  },
});

export default mongoose.model("Session", sessionSchema);
