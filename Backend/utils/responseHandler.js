export const successResponse = (res, statusCode, message, data) => {
  return res.status(statusCode).json({
    status: true,
    message,
    data,
  });
};

export const errorResponse = (res, statusCode, message) => {
  return res.status(statusCode).json({
    status: false,
    message,
  });
};
