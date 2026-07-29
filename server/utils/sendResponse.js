/**
 * Sends a standardized JSON success response.
 *
 * @param {import('express').Response} res - Express response object.
 * @param {number} statusCode - HTTP status code.
 * @param {object} [options]
 * @param {string} [options.message] - Human-readable success message.
 * @param {*} [options.data] - Payload (single doc or array).
 * @param {number} [options.results] - Total count (list endpoints only).
 * @param {number} [options.totalCount]
 */
const sendResponse = (res, statusCode, { message, data, results,totalCount } = {}) => {
  const response = { status: 'success' };
  if (message) response.message = message;
  if (results !== undefined) response.results = results;
  if (totalCount !== undefined) response.totalCount = totalCount;
  if (data !== undefined) response.data = data;
  res.status(statusCode).json(response);
};

export default sendResponse;
