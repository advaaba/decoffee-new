// routes/dailyPatternRoutes.js
const express = require("express");
const router = express.Router();
const {
  analyzeAndSaveDailyPattern,
  getDailyInsightsAndRecommendations,
  getDailyHistory
} = require("../controllers/dailyPatternController");

router.post("/analyze", analyzeAndSaveDailyPattern);

router.get("/get-insights/:userId", getDailyInsightsAndRecommendations);
router.get("/history/:userId", getDailyHistory);
module.exports = router;
