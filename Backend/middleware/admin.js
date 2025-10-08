import { errorResponse } from "../utils/responseHandler.js";

export const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin === true) {
    next();
  } else {
    return errorResponse(res, "Access denied. Admins only.", 403);
  }
};
