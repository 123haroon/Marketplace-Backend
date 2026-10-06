export function errorHandler(err, req, res, next) {
  console.error("ERROR:", err);

  const statusCode = err.statusCode || err.status || 500;

  return res.status(statusCode).json({
    message: err.message || "Internal server error",
  });
}
