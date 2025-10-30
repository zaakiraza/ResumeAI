import express from "express";
import { sendMessage } from "../controllers/contactController.js";

const router = express.Router();

// Public route - no authentication required
// If user is logged in via session/passport, req.user will be available
router.post("/", async (req, res) => {
  return sendMessage(req, res);
});

export default router;
