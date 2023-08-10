// Error handler middleware for express
const errorMessages = {
  400: "Bad Request: The request is missing a required parameter.",
  401: "Unauthorized: Authentication failed.",
  403: "Forbidden: You do not have permission to access this resource.",
  404: "Not Found: The requested resource was not found on the server.",
  500: "Internal Server Error: An unexpected error occurred while processing your request. Please try again later.",
};

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || errorMessages[statusCode];
  res.status(statusCode).json({
    success: false,
    code: statusCode,
    message,
  });
};

export default errorHandler;
