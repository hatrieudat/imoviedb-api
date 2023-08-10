import Country from "../models/countryModel.js";

// @Desc    Get all countries
// @Route   GET /movies/countries
// @Access  Public
const getAllCountries = async (req, res, next) => {
  try {
    const countries = await Country.find();

    res.status(200).json({
      success: true,
      countries,
    });
  } catch (error) {
    next(error);
  }
};

// @Desc    Add a new country
// @Route   POST /movies/countries
// @Access  Private
const addCountry = async (req, res, next) => {
  try {
    const countries = await Country.find();
    const country = await Country.create(req.body);

    res.status(201).json({
      success: true,
      countries: [...countries, country],
    });
  } catch (error) {
    next(error);
  }
};

// @Desc    Update a country
// @Route   PUT /movies/countries/:id
// @Access  Private
const updateCountry = async (req, res, next) => {
  try {
    const countryID = req.params.id;

    // Check if genre exists
    const country = await Country.findById(countryID);
    if (!country) {
      const error = new Error("Country not found. Please provide a valid ID");
      error.statusCode = 404;
      throw error;
    }

    const updatedCountry = await Country.findByIdAndUpdate(
      countryID,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      country: updatedCountry,
    });
  } catch (error) {
    if (error.message === "Validation failed") {
      error.statusCode = 400;
    }
    next(error);
  }
};

// @Desc    Add list contries
// @Route   POST /movies/countries/list
// @Access  Private
const addListCountries = async (req, res, next) => {
  try {
    const { countries } = req.body;
    const addedcountries = await Country.insertMany(countries);

    res.status(201).json({
      success: true,
      countries: addedcountries,
    });
  } catch (error) {
    next(error);
  }
};

// @Desc    Delete a country
// @Route   DELETE /movies/countries/:id
// @Access  Private
const deleteCountry = async (req, res, next) => {
  try {
    const countryID = req.params.id;

    // Check if genre exists
    const country = await Country.findById(countryID);
    if (!country) {
      const error = new Error("Country not found. Please provide a valid ID");
      error.statusCode = 404;
      throw error;
    }

    await Country.findByIdAndDelete(countryID);

    res.status(200).json({
      success: true,
      message: "Country deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export {
  getAllCountries,
  addCountry,
  updateCountry,
  addListCountries,
  deleteCountry,
};
