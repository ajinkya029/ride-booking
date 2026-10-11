function notFound(req, res, next) {
  res.status(404);
  next(new Error(`Route not found: ${req.method} ${req.originalUrl}`));
}

function errorHandler(err, req, res, next) {
  let status = res.statusCode >= 400 ? res.statusCode : 500;
  let message = err.message || "Internal server error";
  let errors;

  if (err.name === "ValidationError") {
    status = 400;
    message = "Validation failed";
    errors = Object.values(err.errors).map((e) => e.message);
  } else if (err.code === 11000) {
    status = 409;
    message = "An account with this email already exists";
  } else if (err.name === "CastError") {
    status = 400;
    message = "Invalid resource ID";
  }

  if (status === 500 && process.env.NODE_ENV === "production") message = "Internal server error";
  res.status(status).json({ success: false, message, ...(errors ? { errors } : {}) });
}

module.exports = { notFound, errorHandler };
