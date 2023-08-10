import Comment from "../models/commentModel.js";
import User from "../models/userModel.js";
import calculatePageIndices from "../utils/calculatePageIndices.js";

// @Desc    Get all comments for a movie
// @Route   GET /movies/:id/comments?limit=&page=
// @Access  Public
const getAllComments = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { limit = 10, page = 1 } = req.query;
    const totalCountComments = await Comment.countDocuments({ movie_id: id });

    const { startIndex, pagination } = calculatePageIndices(
      page,
      limit,
      totalCountComments
    );

    const comments = await Comment.find({ movie_id: id })
      .sort({ date: -1 })
      .skip(startIndex)
      .limit(limit);

    res.status(200).json({
      success: true,
      pagination,
      comments,
    });
  } catch (error) {
    next(error);
  }
};

// @Desc    Add movie comment
// @Route   POST /movies/:id/comments
// @Access  Private
const addMovieComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;

    const user = await User.findById(req.user.id);

    const newComment = new Comment({
      name: user.name,
      email: user.email,
      image: user.image,
      movie_id: id,
      text: comment,
    });

    const commentDoc = await newComment.save();

    res.status(201).json({
      success: true,
      comment: commentDoc,
    });
  } catch (error) {
    next(error);
  }
};

export { addMovieComment, getAllComments };
