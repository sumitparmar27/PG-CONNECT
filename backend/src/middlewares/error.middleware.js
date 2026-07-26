const ApiError = require("../utils/ApiError");

function notFound(req, res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

function errorHandler(err, req, res, next) {
  const statusCode = err instanceof ApiError ? err.statusCode : 500;
  if (statusCode === 500) {
    console.error(err);
  }

  res.status(statusCode).json({
    message: statusCode === 500 ? "Internal server error" : err.message,
  });
}

module.exports = { notFound, errorHandler };
