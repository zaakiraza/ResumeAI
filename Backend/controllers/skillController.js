import Skill from "../models/skill.js";

// Get all skills (for autocomplete suggestions)
export const getAllSkills = async (req, res) => {
  try {
    const { search, category, limit = 100 } = req.query;

    let query = {};

    // Filter by search term
    if (search) {
      query.name = { $regex: search.toLowerCase(), $options: "i" };
    }

    // Filter by category
    if (category && category !== "all") {
      query.category = category;
    }

    const skills = await Skill.find(query)
      .sort({ usageCount: -1, name: 1 }) // Sort by popularity then alphabetically
      .limit(parseInt(limit))
      .select("displayName name category usageCount isVerified");

    res.status(200).json({
      success: true,
      count: skills.length,
      data: skills,
    });
  } catch (error) {
    console.error("Error fetching skills:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch skills",
      error: error.message,
    });
  }
};

// Get popular skills (most used)
export const getPopularSkills = async (req, res) => {
  try {
    const { limit = 20, category } = req.query;

    let query = {};
    if (category && category !== "all") {
      query.category = category;
    }

    const skills = await Skill.find(query)
      .sort({ usageCount: -1 })
      .limit(parseInt(limit))
      .select("displayName name category usageCount");

    res.status(200).json({
      success: true,
      count: skills.length,
      data: skills,
    });
  } catch (error) {
    console.error("Error fetching popular skills:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch popular skills",
      error: error.message,
    });
  }
};

// Add or update a skill (called when user adds a skill to their resume)
export const addOrUpdateSkill = async (req, res) => {
  try {
    const { skillName, category = "other" } = req.body;

    if (!skillName || skillName.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Skill name is required",
      });
    }

    const normalizedName = skillName.trim().toLowerCase();
    const displayName = skillName.trim();

    // Check if skill already exists
    let skill = await Skill.findOne({ name: normalizedName });

    if (skill) {
      // Skill exists, increment usage count
      await skill.incrementUsage();
      res.status(200).json({
        success: true,
        message: "Skill usage count updated",
        data: skill,
        isNew: false,
      });
    } else {
      // Create new skill
      skill = await Skill.create({
        name: normalizedName,
        displayName: displayName,
        category: category,
        usageCount: 1,
        addedBy: req.user._id,
      });

      res.status(201).json({
        success: true,
        message: "New skill added to database",
        data: skill,
        isNew: true,
      });
    }
  } catch (error) {
    console.error("Error adding/updating skill:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add/update skill",
      error: error.message,
    });
  }
};

// Batch add/update skills (when user saves resume with multiple skills)
export const batchAddOrUpdateSkills = async (req, res) => {
  try {
    const { skills } = req.body; // Array of skill names

    if (!Array.isArray(skills) || skills.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Skills array is required",
      });
    }

    const results = {
      updated: [],
      created: [],
    };

    for (const skillName of skills) {
      if (!skillName || skillName.trim() === "") continue;

      const normalizedName = skillName.trim().toLowerCase();
      const displayName = skillName.trim();

      let skill = await Skill.findOne({ name: normalizedName });

      if (skill) {
        await skill.incrementUsage();
        results.updated.push(skill.displayName);
      } else {
        skill = await Skill.create({
          name: normalizedName,
          displayName: displayName,
          category: "other", // Default category, can be updated later
          usageCount: 1,
          addedBy: req.user._id,
        });
        results.created.push(skill.displayName);
      }
    }

    res.status(200).json({
      success: true,
      message: "Skills processed successfully",
      data: results,
    });
  } catch (error) {
    console.error("Error batch processing skills:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process skills",
      error: error.message,
    });
  }
};

// Get skill suggestions based on partial input
export const getSkillSuggestions = async (req, res) => {
  try {
    const { query, limit = 10 } = req.query;

    if (!query || query.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const skills = await Skill.find({
      name: { $regex: `^${query.toLowerCase()}`, $options: "i" }, // Starts with query
    })
      .sort({ usageCount: -1, name: 1 })
      .limit(parseInt(limit))
      .select("displayName name category usageCount");

    res.status(200).json({
      success: true,
      count: skills.length,
      data: skills,
    });
  } catch (error) {
    console.error("Error fetching skill suggestions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch suggestions",
      error: error.message,
    });
  }
};

// Get skills by category
export const getSkillsByCategory = async (req, res) => {
  try {
    const categories = [
      "programming",
      "framework",
      "database",
      "tool",
      "soft-skill",
      "language",
      "design",
      "marketing",
      "other",
    ];

    const skillsByCategory = {};

    for (const category of categories) {
      const skills = await Skill.find({ category })
        .sort({ usageCount: -1 })
        .limit(20)
        .select("displayName name usageCount");

      skillsByCategory[category] = skills;
    }

    res.status(200).json({
      success: true,
      data: skillsByCategory,
    });
  } catch (error) {
    console.error("Error fetching skills by category:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch skills by category",
      error: error.message,
    });
  }
};

// Admin: Verify a skill
export const verifySkill = async (req, res) => {
  try {
    const { skillId } = req.params;

    const skill = await Skill.findByIdAndUpdate(
      skillId,
      { isVerified: true },
      { new: true }
    );

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: "Skill not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Skill verified successfully",
      data: skill,
    });
  } catch (error) {
    console.error("Error verifying skill:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify skill",
      error: error.message,
    });
  }
};

// Admin: Update skill category
export const updateSkillCategory = async (req, res) => {
  try {
    const { skillId } = req.params;
    const { category } = req.body;

    const skill = await Skill.findByIdAndUpdate(
      skillId,
      { category },
      { new: true }
    );

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: "Skill not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Skill category updated successfully",
      data: skill,
    });
  } catch (error) {
    console.error("Error updating skill category:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update skill category",
      error: error.message,
    });
  }
};
