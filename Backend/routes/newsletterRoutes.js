import express from "express";
import { subscribe, unsubscribe, getStats } from "../controllers/newsletterController.js";
import {authenticateToken} from "../middleware/authentication.js";
import {admin} from "../middleware/admin.js";

const router = express.Router();

// Public routes
router.post("/subscribe", subscribe);
router.post("/unsubscribe", unsubscribe);

// Admin route
router.get("/stats", authenticateToken, admin, getStats);

export default router;
