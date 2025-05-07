// routes/patternRoutes.js
const express = require("express");
const router = express.Router();
const {
  analyzeAndSaveUserPattern,
  getUserInsightsAndRecommendations,
} = require("../controllers/patternController");

// ניתוח ושמירה
router.post("/analyze", analyzeAndSaveUserPattern);

// שליפה עם סוג (type=general או type=daily)
router.get("/get-insights/:userId", getUserInsightsAndRecommendations);

module.exports = router;
