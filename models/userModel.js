// Define user model schema
import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    // Image is a URL string
    image: {
      type: String,
      // Default image is a placeholder avatar if user does not upload an image0
      default:
        "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
    },
    // Email is a string and is required to be unique
    email: {
      type: String,
      unique: true,
      trim: true,
      required: [true, "Please provide an email"],
      lowercase: true,
      validate: {
        validator: function (v) {
          return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
        },
        message: "Please enter a valid email",
      },
    },
    password: {
      type: String,
      minlength: 6,
      required: true,
    },
    // Role is required to be either "user" or "admin"
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    // Saved movies is an array of movie ID
    savedMovies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Movie",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Create hash password method
userSchema.methods.createPasswordHash = async function (password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Hash password before saving to database (mongoose middleware)
userSchema.pre("save", async function (next) {
  // this refers to the current user object (i.e. the user that is about to be saved)
  const user = this;

  // Hash the password
  // const salt = await bcrypt.genSalt(10);
  user.password = await user.createPasswordHash(user.password); // await bcrypt.hash(user.password, salt);
  next();
});

// Check if password entered by user matches the hashed password in database
// This function is used in the login route to check if the user's password is correct
userSchema.methods.matchPassword = async function (enteredPassword) {
  // this refers to the current user object (i.e. the user that is trying to log in)
  const user = this;

  // If the entered password matches the hashed password in the database, the promise will return true.
  // If the entered password does not match the hashed password in the database, the promise will return false.
  // If the entered password is empty, the promise will return false.
  return await bcrypt.compare(enteredPassword, user.password);
};

export default mongoose.model("User", userSchema);
