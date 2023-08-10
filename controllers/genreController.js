import Genre from "../models/genreModel.js";

// @Desc    Get all genres
// @Route   GET /movies/genres
// @Access  Public
const getAllGenres = async (req, res, next) => {
  try {
    const genres = await Genre.find();

    res.status(200).json({
      success: true,
      genres,
    });
  } catch (error) {
    next(error);
  }
};

// @Desc    Add a new genre
// @Route   POST /movies/genres
// @Access  Private
const addGenre = async (req, res, next) => {
  try {
    const genres = await Genre.find();
    const genre = await Genre.create(req.body);

    res.status(201).json({
      success: true,
      genres: [...genres, genre],
    });
  } catch (error) {
    next(error);
  }
};

// @Desc    Update a genre
// @Route   PUT /movies/genres/:id
// @Access  Private
const updateGenre = async (req, res, next) => {
  try {
    const genreID = req.params.id;

    // Check if genre exists
    const genre = await Genre.findById(genreID);
    if (!genre) {
      const error = new Error("Genre not found. Please provide a valid ID");
      error.statusCode = 404;
      throw error;
    }

    const updatedGenre = await Genre.findByIdAndUpdate(genreID, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      genre: updatedGenre,
    });
  } catch (error) {
    if (error.message === "Validation failed") {
      error.statusCode = 400;
    }
    next(error);
  }
};

// @Desc    Delete a genre
// @Route   DELETE /movies/genres/:id
// @Access  Private
const deleteGenre = async (req, res, next) => {
  try {
    const genreID = req.params.id;

    // Check if genre exists
    const genre = await Genre.findById(genreID);
    if (!genre) {
      const error = new Error("Genre not found. Please provide a valid ID");
      error.statusCode = 404;
      throw error;
    }

    await Genre.findByIdAndDelete(genreID);

    res.status(200).json({
      success: true,
      message: "Genre deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export { getAllGenres, addGenre, updateGenre, deleteGenre };
