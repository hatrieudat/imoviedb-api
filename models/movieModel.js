// Define movie model schema
import mongoose from "mongoose";

const Schema = mongoose.Schema;

const movieSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    genres: {
      type: [String],
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["movie", "series"],
      lowercase: true,
    },
    released: {
      type: Date,
      required: true,
    },
    poster: {
      type: String,
      default: `https://picsum.photos/seed/${Math.floor(
        Math.random() * 1000000
      )}/300/400`,
    },
    plot: { type: String, default: "" },
    fullplot: { type: String, default: "" },
    runtime: { type: Number, required: true },
    rated: {
      type: String,
      required: true,
      enum: [
        "AO",
        "APPROVED",
        "Approved",
        "G",
        "GP",
        "M",
        "NC-17",
        "NOT RATED",
        "Not Rated",
        "OPEN",
        "PASSED",
        "PG",
        "PG-13",
        "R",
        "TV-14",
        "TV-G",
        "TV-MA",
        "TV-PG",
        "TV-Y7",
        "UNRATED",
        "X",
      ],
      uppercase: true,
    },
    directors: { type: [String], default: [] },
    writers: { type: [String], default: [] },
    cast: { type: [String], default: [] },
    imdb: {
      id: {
        type: Number,
        default: 0,
        validate: {
          validator: function (value) {
            return value >= 0;
          },
          message: "Imdb id is not a positive number",
        },
      },
      votes: {
        type: Number,
        default: 0,
        validate: {
          validator: function (value) {
            return value >= 0;
          },
          message: "Imdb votes is not a positive number",
        },
      },
      rating: {
        type: Number,
        default: 0,
        validate: {
          validator: function (value) {
            return value >= 0 && value <= 10;
          },
          message: "Imdb rating is not in range of 0 to 10",
        },
      },
    },
    countries: { type: [String], default: [] },
  },
  { timestamps: true }
);

// Check all required fields are filled and throw which field missing of movieSchema
movieSchema.pre("validate", function (next) {
  if (!this.title) {
    throw new Error("Title is required");
  }
  if (!this.type) {
    throw new Error("Type is required");
  }
  if (!this.genres || this.genres.length === 0 || this.genres[0] === "") {
    throw new Error("Genres is required");
  }
  if (!this.released) {
    throw new Error("Released is required");
  }
  if (!this.runtime) {
    throw new Error("Runtime is required");
  }
  if (!this.rated) {
    throw new Error("Rated is required");
  }
  next();
});

// Check year of released is in range of 1900 to current year
movieSchema.path("released").validate(function (value) {
  const releasedYear = value.getFullYear();
  const currentYear = new Date().getFullYear();
  if (releasedYear > currentYear || releasedYear < 1900) {
    throw new Error("Year of released is not in range of 1900 to current year");
  }
  return Promise.resolve();
});

// Check runtime is a positive number and in range of 1 to 300 minutes
movieSchema.path("runtime").validate(function (value) {
  if (value < 1 || value > 300) {
    throw new Error("Runtime is not in range of 1 to 300 minutes");
  }
  return Promise.resolve();
});

// Convert comma seperated string to array and capitalize each item in array
// If array is passed, convert each item in array to capitalize
// If string is passed, convert string to array and capitalize each item in array
// If string is passed with comma seperated items, convert each item in array to capitaliz
movieSchema.methods.convertToArray = async function (param) {
  const funcToGetArr = async (array) => {
    return await array
      .map((item) => {
        const trim = item.trim();
        const capatilized = trim.charAt(0).toUpperCase() + trim.slice(1);
        return capatilized;
      })
      .filter((item) => item !== "");
  };

  if (param.length > 1) {
    if (typeof param === "string") {
      const arr = await funcToGetArr(param.split(","));
      return await arr;
    }
    const arr = await funcToGetArr(param);
    return await arr;
  }

  if (Array.isArray(param)) {
    const arr = funcToGetArr(param[0].split(","));
    return await arr;
  }
};

movieSchema.pre("save", async function (next) {
  const movie = this;
  if (movie.genres && movie.genres.length > 0) {
    this.genres = await movie.convertToArray(movie.genres);
  }

  if (movie.countries && movie.countries.length > 0) {
    this.countries = await movie.convertToArray(movie.countries);
  }

  if (movie.directors && movie.directors.length > 0) {
    this.directors = await movie.convertToArray(movie.directors);
  }

  if (movie.writers && movie.writers.length > 0) {
    this.writers = await movie.convertToArray(movie.writers);
  }

  if (movie.cast && movie.cast.length > 0) {
    this.cast = await movie.convertToArray(movie.cast);
  }
  next();
});

export default mongoose.model("Movie", movieSchema);
