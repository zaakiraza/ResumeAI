import express from "express";
import {
  getAllSkills,
  getPopularSkills,
  addOrUpdateSkill,
  batchAddOrUpdateSkills,
  getSkillSuggestions,
  getSkillsByCategory,
  verifySkill,
  updateSkillCategory,
} from "../controllers/skillController.js";
import { authenticateToken } from "../middleware/authentication.js";
import { admin } from "../middleware/admin.js";

const router = express.Router();

// Public routes (no authentication needed for suggestions)
router.get("/suggestions", getSkillSuggestions);
router.get("/popular", getPopularSkills);
router.get("/by-category", getSkillsByCategory);
router.get("/", getAllSkills);

// Protected routes (user must be authenticateTokend)
router.post("/add", authenticateToken, addOrUpdateSkill);
router.post("/batch", authenticateToken, batchAddOrUpdateSkills);

// Admin routes
router.put("/:skillId/verify", authenticateToken, admin, verifySkill);
router.put("/:skillId/category", authenticateToken, admin, updateSkillCategory);

export default router;
