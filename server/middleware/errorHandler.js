/*
  Error handler for CUNY-Connect.
  This file turns any error passed to next(err), or thrown inside an async route,
  into a JSON response so the client always gets the same error shape.
  Owner: Person 1
  TODO: Map mongoose validation and cast errors to 400, duplicate key errors to 409,
  and JWT errors to 401.
*/

/**
 * Sends a JSON error response for any error raised in a route.
 *
 * Express only treats this as an error handler because it takes four arguments,
 * so next has to stay in the signature.
 *
 * @param {Error} err The error that was thrown or passed to next.
 * @param {object} req The incoming request.
 * @param {object} res The response object.
 * @param {function} next Hands the error to Express if a response was already started.
 */
function errorHandler(err, req, res, next) {
  // Once part of a response is sent, only Express's default handler can safely close the connection.
  if (res.headersSent) return next(err);

  const status = err.status || err.statusCode || 500;

  // Only server errors are logged, because 4xx errors are expected and would clutter the terminal.
  if (status >= 500) console.error(err);

  res.status(status).json({
    message: err.message || 'Internal Server Error',
    // The stack trace helps while developing but would leak internals in production.
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
}

module.exports = errorHandler;
