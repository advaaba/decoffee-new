// routes/dailyPatternRoutes.js
const express = require("express");
const router = express.Router();
const {
  analyzeAndSaveDailyPattern,
  getDailyInsightsAndRecommendations,
} = require("../controllers/dailyPatternController");

// ניתוח יומי ושמירת תובנות והמלצות
router.post("/analyze", analyzeAndSaveDailyPattern);

// שליפת תובנות והמלצות יומיות למשתמש
router.get("/get-insights/:userId", getDailyInsightsAndRecommendations);

module.exports = router;
