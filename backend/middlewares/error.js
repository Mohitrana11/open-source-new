export default function errorMiddleware(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  // Duplicate Key Error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    err.message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    err.statusCode = 400;
  }

  // Cast Error — invalid MongoDB ObjectId
  if (err.name === "CastError") {
    err.message = `Invalid ${err.path}: ${err.value}`;
    err.statusCode = 400;
  }

  // Validation Error
  if (err.name === "ValidationError") {
    err.message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
    err.statusCode = 400;
  }

  // JWT Errors
  if (err.name === "JsonWebTokenError") {
    err.message = "Invalid token, please login again";
    err.statusCode = 401;
  }

  if (err.name === "TokenExpiredError") {
    err.message = "Token expired, please login again";
    err.statusCode = 401;
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
}
