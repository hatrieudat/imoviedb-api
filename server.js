// Import dependencies
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/database.js";

// Import routes
import userRoutes from "./routes/userRoute.js";
import authRoutes from "./routes/authRoute.js";
import movieRoutes from "./routes/movieRoute.js";

// Import middlewares
import errorHandler from "./middlewares/errorMiddleware.js";

// Create Express app
const app = express();
dotenv.config();
app.disable("x-powered-by");

// Configure CORS middleware for handling cross-origin requests
const corsOptions = {
  origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  preflightContinue: false,
};
app.use(cors(corsOptions));

// Parse request bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Use routes
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/movies", movieRoutes);

// Handle errors
app.use((req, res, next) => {
  const err = new Error();
  err.statusCode = 404;
  next(err);
});
app.use(errorHandler);

// Connect to the database (MongoDB)
connectDB()
  .then(() => {
    console.log("Database connected successfully");

    // Start Express server
    app.listen(process.env.PORT || 3000, () => {
      console.log("Server started successfully");
      console.log("Server listening on port 3000");
      console.log("====================================");
    });
  })
  .catch((error) => {
    console.log("Database connection failed");
    console.log("Server failed to start");
    console.log("====================================");
    console.log("Error:", error.message);
    process.exit(1);
  });
