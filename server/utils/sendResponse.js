
const sendResponse = (res, statusCode, { message, data, results } = {}) => {
  const response = { status: 'success' };
  if (message) response.message = message;
  if (results !== undefined) response.results = results;
  if (data !== undefined) response.data = data;
  res.status(statusCode).json(response);
};

export default sendResponse;
