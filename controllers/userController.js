import User from "../models/userModel.js";
import calculatePageIndices from "../utils/calculatePageIndices.js";
import uploadFileToFirebase, {
  deleteFileToFirebase,
} from "../utils/uploadFileToFirebase.js";

// @desc    Get all users
// @route   GET /users?page=&limit=
// @access  Private/Admin
const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const totalCountUsers = await User.countDocuments();
    const { startIndex, pagination } = calculatePageIndices(
      page,
      limit,
      totalCountUsers
    );

    const users = await User.find()
      .skip(startIndex)
      .limit(limit)
      .lean()
      .sort({ name: 1, email: 1 });

    res.status(200).json({
      success: true,
      pagination,
      users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user by ID
// @route   GET /users/:id
// @access  Private/Admin
const getUser = async (req, res, next) => {
  try {
    const userID = req.params.id;
    // Check userID exist
    if (!userID) {
      throw new Error("Missing user ID");
    }

    const user = await User.findById(userID);
    // Check if user exists
    if (!user) {
      throw new Error("User not found");
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    switch (error.message) {
      case "User not found":
      case "Missing user ID":
        error.message += ". Please provide available user id";
        error.statusCode = 404;
        break;
      default:
        error.message = "Please provide valid user id";
        error.statusCode = 400;
        break;
    }
    next(error);
  }
};

// @desc    Delete user by ID
// @route   DELETE /users/:id
// @access  Private/Admin
const deleteUser = async (req, res, next) => {
  try {
    const userID = req.params.id;
    // Check userID exist
    if (!userID) {
      throw new Error("Missing user ID");
    }

    const user = await User.findById(userID);
    // Check if user exists
    if (!user) {
      throw new Error("User not found");
    }

    // Check role of user to delete
    if (user.role === "admin") {
      throw new Error("User deletion request");
    }

    // Delete user image from firebase
    if (user.image) {
      const imagePath = "users/" + user.image.split("/").pop();
      await deleteFileToFirebase(imagePath);
    }

    await User.findByIdAndDelete(user._id);

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    switch (error.message) {
      case "User not found":
      case "Missing user ID":
        error.message += ". Please provide available user id";
        error.statusCode = 404;
        break;
      case "User deletion request":
        error.message = "Cannot delete admin";
        error.statusCode = 400;
        break;
      default:
        break;
    }
    next(error);
  }
};

// @desc    Search user by name, email and filter admin/user/all
// @route   GET /users/search?q=&filter=&page=&limit=
// @access  Private/Admin
const searchUsers = async (req, res, next) => {
  try {
    const { q = "", filter = "", page = 1, limit = 10 } = req.query;

    // Declare query object to search users by name, email and filter admin/user/empty
    let query = {};
    // Check if query is not empty
    if (q) {
      query = {
        $or: [
          {
            name: {
              $regex: q,
              $options: "i",
            },
          },
          {
            email: {
              $regex: q,
              $options: "i",
            },
          },
        ],
      };
    }
    // Check if filter is not empty
    if (filter) {
      query.role = {
        $regex: filter,
        $options: "i",
      };
    }

    const totalCountUsers = (await User.find(query)).length;

    const { startIndex, pagination } = calculatePageIndices(
      page,
      limit,
      totalCountUsers
    );

    const users = await User.find(query).skip(startIndex).limit(limit).lean();

    res.status(200).json({
      success: true,
      pagination,
      users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add user
// @route   POST /users
// @access  Private/Admin
const addUser = async (req, res, next) => {
  try {
    const user = new User(req.body);

    const userExists = await User.findOne({ email: user.email });
    if (userExists) {
      throw new Error("User already exists");
    }

    await user.save();

    if (req.file) {
      const newImage = req.file;
      const newImagePath = "users/" + user._id + "-" + Date.now();
      const oldImage = user.image || "/"; // Default image path if user image does not exists
      const oldImagePath = "users/" + oldImage.split("/").pop();

      // Upload new image file to firebase storage
      user.image = await uploadFileToFirebase(
        oldImage,
        newImage,
        oldImagePath,
        newImagePath
      );

      await User.findByIdAndUpdate(user._id, { image: user.image });
    }

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user,
    });
  } catch (error) {
    error.statusCode = 400;
    next(error);
  }
};

// @desc    Update user by ID
// @route   PUT /users/:id
// @access  Private/Admin
const updateUser = async (req, res, next) => {
  try {
    const userID = req.params.id;

    // Check userID exist
    if (!userID) {
      throw new Error("Missing user ID");
    }

    const user = await User.findById(userID);
    // Check if user exists
    if (!user) {
      throw new Error("User not found");
    }

    // Check unique email of user to update email
    if (req.body?.email) {
      const userExists = await User.findOne({ email: req.body.email });
      if (userExists) {
        throw new Error("Email already exists");
      }
    }

    // Check password of user to update hash password
    if (req.body?.password) {
      const newHashPassword = await user.createPasswordHash(req.body.password);
      req.body.password = newHashPassword;
    }

    const updatedUser = await User.findByIdAndUpdate(userID, req.body, {
      new: true, // Return new user object
      runValidators: true, // Run validators on update operation
    });

    // Uploaded image file
    if (req.file) {
      const newImage = req.file;
      const newImagePath = "users/" + user._id + "-" + Date.now();
      const oldImage = user.image || "/"; // Default image path if user image does not exists
      const oldImagePath = "users/" + oldImage.split("/").pop();

      // Upload new image file to firebase storage
      updatedUser.image = await uploadFileToFirebase(
        oldImage,
        newImage,
        oldImagePath,
        newImagePath
      );

      await User.findByIdAndUpdate(userID, { image: updatedUser.image });
    }

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    error.statusCode = 400;
    switch (error.message) {
      case "User not found":
      case "Missing user ID":
        error.message += ". Please provide available user id";
        error.statusCode = 404;
        break;
      case "Error uploading image file":
        error.message += ". Please try again";
        break;
      case "Email already exists":
        error.message += ". Please provide another unique email";
        break;
      default:
        error.message = error.codeName;
        break;
    }
    next(error);
  }
};

// @desc    Get own user
// @route   GET /users/me
// @access  Private
const getOwnUser = async (req, res, next) => {
  try {
    const userID = req.user.id;
    const user = await User.findById(userID);

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update own user
// @route   PUT /users/me
// @access  Private
const updateOwnUser = async (req, res, next) => {
  try {
    const userID = req.user.id;
    const user = await User.findById(userID);

    // Check unique email of user to update email
    if (req.body?.email) {
      const userExists = await User.findOne({ email: req.body.email });
      if (userExists) {
        throw new Error("Email already exists");
      }
    }

    // Check password of user to update hash password
    if (req.body?.password) {
      const newHashPassword = await user.createPasswordHash(req.body.password);
      req.body.password = newHashPassword;
    }

    // Cannot update role of user
    if (req.body?.role) {
      req.body.role = user.role;
    }

    // Uploaded image file
    if (req.file) {
      const newImage = req.file;
      const newImagePath = "users/" + user._id + "-" + Date.now();
      const oldImage = user.image || "/"; // Default image path if user image does not exists
      const oldImagePath = "users/" + oldImage.split("/").pop();

      // Upload new image file to firebase storage
      // @@function  uploadFileToFirebase
      // @@param     oldImage, newImage, oldImagePath, newImagePath
      // @@return    newImageUrl
      req.body.image = await uploadFileToFirebase(
        oldImage,
        newImage,
        oldImagePath,
        newImagePath
      );
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(userID, req.body, {
      new: true, // Return new user object
      runValidators: true, // Run validators on update operation
    });

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    if (error.message === "Email already exists") {
      error.statusCode = 400;
      error.message += ". Please provide another unique email";
    }
    next(error);
  }
};

// @Desc    Get all saved movies of user
// @Route   GET /users/saved-movies?limit=&page=
// @Access  Private
const getSavedMovies = async (req, res, next) => {
  try {
    const userID = req.user.id;
    const { limit = 10, page = 1 } = req.query;
    const user = await User.findById(userID);

    if (user.savedMovies.length !== 0) {
      const { startIndex, pagination } = calculatePageIndices(
        page,
        limit,
        user.savedMovies.length
      );

      await user.populate({
        path: "savedMovies",
        options: {
          skip: startIndex,
          limit: limit,
        },
      });

      res.status(200).json({
        success: true,
        savedMovies: {
          pagination,
          movies: user.savedMovies,
        },
      });
    } else {
      res.status(200).json({
        success: true,
        savedMovies: user.savedMovies,
      });
    }
  } catch (error) {
    next(error);
  }
};

// @Desc    Save movie to user's list
// @Route   POST /users/saved-movies/:id
// @Access  Private
const saveMovie = async (req, res, next) => {
  try {
    const userID = req.user.id;
    const movieID = req.params.id;

    // Check movieID exist
    if (!movieID) {
      throw new Error("Missing movie ID");
    }

    const user = await User.findById(userID);

    // Check if movieID exists in user's list
    if (user.savedMovies.includes(movieID)) {
      throw new Error("Movie already exists in user's saved movies list");
    }

    // Add movieID to user's list
    user.savedMovies.push(movieID);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Movie added to user's list successfully",
      saveMovie: user.savedMovies,
    });
  } catch (error) {
    if (error.message === "Missing movie ID") {
      error.statusCode = 400;
      error.message += ". Please provide movie ID";
    }
    if (error.message === "Movie already exists in user's saved movies list") {
      error.statusCode = 400;
      error.message += ". Please provide another unique movie ID";
    }
    next(error);
  }
};

// @Desc    Delete movie from user's saved movies list
// @Route   DELETE /users/saved-movies/:id
// @Access  Private
const deleteSavedMovie = async (req, res, next) => {
  try {
    const userID = req.user.id;
    const movieID = req.params.id;

    // Check movieID exist
    if (!movieID) {
      throw new Error("Missing movie ID");
    }

    const user = await User.findById(userID);

    // Check if movieID exists in user's list
    if (!user.savedMovies.includes(movieID)) {
      throw new Error("Movie does not exist in user's saved movies list");
    }

    // Delete movieID from user's list
    user.savedMovies.pull(movieID);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Movie deleted from user's list successfully",
      saveMovie: user.savedMovies,
    });
  } catch (error) {
    if (error.message === "Missing movie ID") {
      error.statusCode = 400;
      error.message += ". Please provide movie ID";
    }
    next(error);
  }
};

export {
  getAllUsers,
  getUser,
  deleteUser,
  searchUsers,
  addUser,
  updateUser,
  getOwnUser,
  updateOwnUser,
  getSavedMovies,
  saveMovie,
  deleteSavedMovie,
};
