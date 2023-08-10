import Movie from "../models/movieModel.js";
import calculatePageIndices from "../utils/calculatePageIndices.js";
import uploadFileToFirebase, {
  deleteFileToFirebase,
} from "../utils/uploadFileToFirebase.js";

const sortingOptions = {
  titleSort: { title: -1 },
  yearAscending: { year: 1 },
  yearDescending: { year: -1 },
  ratingAscending: { "imdb.rating": 1 },
  ratingDescending: { "imdb.rating": -1 },
};

// @Desc    Get all movies
// @Route   GET /movies?page=&limit=&sort=
// @Access  Public
const getAllMovies = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sort = "yearDescending" } = req.query;
    const totalCountMovies = await Movie.countDocuments();

    const { startIndex, pagination } = calculatePageIndices(
      page,
      limit,
      totalCountMovies
    );

    const movies = await Movie.find()
      .sort(sortingOptions[sort] || sortingOptions.yearDescending)
      .limit(limit)
      .skip(startIndex)
      .lean();

    res.status(200).json({
      success: true,
      pagination,
      movies,
    });
  } catch (error) {
    next(error);
  }
};

// @Desc    Get single movie by id
// @Route   GET /movies/:id
// @Access  Public
const getMovieByID = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if movie id is not provided
    if (!id) {
      throw new Error("MovieID_Missing");
    }

    const movie = await Movie.findById(id).lean();

    // Check if movie is not found
    if (!movie) {
      throw new Error("Movie_Not_Found");
    }

    res.status(200).json({
      success: true,
      movie,
    });
  } catch (error) {
    switch (error.message) {
      case "MovieID_Missing":
        error.message = "Movie ID is required.";
        error.statusCode = 400;
        break;
      case "Movie_Not_Found":
        error.message =
          "Movie not found. Please provide available movie id in the request.";
        error.statusCode = 404;
        break;
      default:
        break;
    }
    next(error);
  }
};

// @Desc    Search movies by title, fullplot, genre, year, type, director, cast, rated, country
// @Route   GET /movies/search?q=&genres=&year=&type=&cast=&runtime=country=&page=&limit=&sort=
// @Access  Public
const searchMovies = async (req, res, next) => {
  try {
    const {
      q,
      genres,
      year,
      type,
      cast,
      runtime,
      country,
      page = 1,
      limit = 10,
      sort = "titleSort",
    } = req.query;

    let query = {};
    //==============================================//
    // Check if query is provided
    if (q) {
      query.$or = [
        { title: { $regex: q, $options: "i" } },
        { fullplot: { $regex: q, $options: "i" } },
        { cast: { $regex: q, $options: "i" } },
        { directors: { $regex: q, $options: "i" } },
        { writers: { $regex: q, $options: "i" } },
      ];
    }
    // Check if genre is provided
    if (genres) {
      const genreArr = genres.split(",");
      query.$and = genreArr.map((genre) => ({
        genres: { $regex: genre.trim(), $options: "i" },
      }));
    }
    // Check if year is provided
    if (year) {
      query.$expr = {
        $eq: [{ $year: "$released" }, year],
      };
    }
    // Check if type is provided
    if (type) {
      query.type = { $regex: type, $options: "i" };
    }
    // Check if cast is provided
    if (cast) {
      query.cast = { $regex: cast, $options: "i" };
    }
    // Check if runtime is provided
    if (runtime) {
      // Regex to check if runtime is in the form of "from-to"
      const regexRuntime = /^(\d+)-(\d+)$/g;
      if (!regexRuntime.test(runtime)) {
        throw new Error("Runtime_Invalid");
      }
      const [from, to] = runtime.split("-");
      // Check if from is less than to
      if (from > to) {
        throw new Error("Runtime_Invalid");
      }
      query.runtime = from === to ? { $eq: from } : { $gte: from, $lte: to };
    }
    // Check if country is provided
    if (country) {
      query.countries = { $regex: country, $options: "i" };
    }
    //==============================================//

    const totalCountMovies = await Movie.countDocuments(query);
    const { startIndex, pagination } = calculatePageIndices(
      page,
      limit,
      totalCountMovies
    );

    const movies = await Movie.find(query)
      .sort(sortingOptions[sort] || sortingOptions.titleSort)
      .limit(limit)
      .skip(startIndex)
      .lean();

    res.status(200).json({
      success: true,
      pagination,
      movies,
    });
  } catch (error) {
    if (error.message === "Runtime_Invalid") {
      error.message =
        "Runtime must be in the form of 'from-to'. And 'from' number must be less than 'to' number.";
      error.statusCode = 400;
    }
    next(error);
  }
};

// @Desc    Get 10 top rated movies by type (movie or series)
// @Route   GET /movies/top-rated?type=
// @Access  Public
const getTopRatedMovies = async (req, res, next) => {
  try {
    const { type } = req.query;

    // Check if type is not provided
    if (!type) {
      throw new Error("Type_Missing");
    }

    // Check if type is not valid
    const regexType = /^(movie|series)$/i;
    if (!regexType.test(type)) {
      throw new Error("Type_Invalid");
    }

    const movies = await Movie.find({ type: { $regex: type, $options: "i" } })
      .limit(10)
      .lean();

    res.status(200).json({
      success: true,
      movies,
    });
  } catch (error) {
    if (error.message === "Type_Missing") {
      error.message = "Type is required.";
      error.statusCode = 400;
    }
    if (error.message === "Type_Invalid") {
      error.message = "Type must be either movie or series.";
      error.statusCode = 400;
    }
    next(error);
  }
};

// @Desc    Get 10 random movies
// @Route   GET /movies/random
// @Access  Public
const getRandomMovies = async (req, res, next) => {
  try {
    const movies = await Movie.aggregate([{ $sample: { size: 10 } }]);

    res.status(200).json({
      success: true,
      movies,
    });
  } catch (error) {
    next(error);
  }
};

// @Desc    Add new movie
// @Route   POST /movies
// @Access  Private
const addMovie = async (req, res, next) => {
  try {
    const movie = new Movie(req.body);

    await movie.validate().catch((error) => {
      error.statusCode = 400;
      throw error;
    });

    await movie.save();

    if (req.file) {
      const newImage = req.file;
      const newImagePath = "movies/" + movie._id + "-" + Date.now();
      const oldImage = movie.poster || "/"; // Default image path if movie image does not exists
      const oldImagePath = "movies/" + oldImage.split("/").pop();

      // Upload new image file to firebase storage
      movie.poster = await uploadFileToFirebase(
        oldImage,
        newImage,
        oldImagePath,
        newImagePath
      );

      await Movie.findByIdAndUpdate(movie._id, {
        poster: movie.poster,
      });
    }

    res.status(201).json({
      success: true,
      message: "Movie created successfully.",
      movie,
    });
  } catch (error) {
    next(error);
  }
};

// @Desc    Update movie
// @Route   PUT /movies/:id
// @Access  Private
const updateMovie = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if movie id is not provided
    if (!id) {
      throw new Error("MovieID_Missing");
    }

    // Check if movie is not found
    const movie = await Movie.findById(id);
    if (!movie) {
      throw new Error("Movie_Not_Found");
    }

    movie.set(req.body);

    const updatedMovie = await movie.save();

    if (req.file) {
      const newImage = req.file;
      const newImagePath = "movies/" + movie._id + "-" + Date.now();
      const oldImage = movie.poster || "/"; // Default image path if movie image does not exists
      const oldImagePath = "movies/" + oldImage.split("/").pop();

      // Upload new image file to firebase storage
      updatedMovie.poster = await uploadFileToFirebase(
        oldImage,
        newImage,
        oldImagePath,
        newImagePath
      );

      await Movie.findByIdAndUpdate(updatedMovie._id, {
        poster: updatedMovie.poster,
      });
    }

    res.status(200).json({
      success: true,
      message: "Movie updated successfully.",
      movie: updatedMovie,
    });
  } catch (error) {
    if (error.message === "MovieID_Missing") {
      error.message = "Movie ID is required. Please provide movie ID";
      error.statusCode = 400;
    }
    if (error.message === "Movie_Not_Found") {
      error.message = "Movie not found. Please provide valid movie ID";
      error.statusCode = 404;
    }
    next(error);
  }
};

// @Desc    Delete movie
// @Route   DELETE /movies/:id
// @Access  Private
const deleteMovie = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if movie id is not provided
    if (!id) {
      throw new Error("MovieID_Missing");
    }

    // Check if movie is not found
    const movie = await Movie.findById(id);
    if (!movie) {
      throw new Error("Movie_Not_Found");
    }

    // Delete movie from firebase storage
    if (movie.poster) {
      const oldImage = movie.poster || "/";
      const oldImagePath = "movies/" + oldImage.split("/").pop();
      await deleteFileToFirebase(oldImagePath);
    }

    // Delete movie from database
    await Movie.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Movie deleted successfully.",
    });
  } catch (error) {
    if (error.message === "MovieID_Missing") {
      error.message = "Movie ID is required. Please provide movie ID";
      error.statusCode = 400;
    }
    if (error.message === "Movie_Not_Found") {
      error.message = "Movie not found. Please provide valid movie ID";
      error.statusCode = 404;
    }
    next(error);
  }
};

export {
  getAllMovies,
  getMovieByID,
  searchMovies,
  getTopRatedMovies,
  getRandomMovies,
  addMovie,
  updateMovie,
  deleteMovie,
};
