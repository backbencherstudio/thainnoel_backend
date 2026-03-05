/**
 * Utility to wrap asynchronous controller functions and catch errors,
 * passing them to the global error handling middleware.
 *
 * @param {Function} fn - The asynchronous controller function to wrap
 * @returns {Function} - A middleware-compatible function
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default catchAsync;
