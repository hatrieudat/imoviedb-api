import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();
const {
  MONGODB_USERNAME,
  MONGODB_PASSWORD,
  MONGODB_CLUSTER_URL,
  MONGODB_DBNAME,
} = process.env;

// MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/<dbname>?retryWrites=true&w=majority
const MONGODB_URI = `mongodb+srv://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@${MONGODB_CLUSTER_URL}/${MONGODB_DBNAME}?retryWrites=true&w=majority`;

// Connect to the MongoDB database
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  } catch (err) {
    throw new Error(err.message);
  }
};

export default connectDB;
