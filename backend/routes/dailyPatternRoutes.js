// routes/dailyPatternRoutes.js
const express = require("express");
const router = express.Router();
const {
  analyzeAndSaveDailyPattern,
  getDailyInsightsAndRecommendations,
  getDailyHistory,
} = require("../controllers/dailyPatternController");
const RecommendationModel = require("../models/Recommendation");

router.post("/analyze", analyzeAndSaveDailyPattern);

router.get("/get-insights/:userId", getDailyInsightsAndRecommendations);
router.get("/history/:userId", getDailyHistory);
router.put("/feedback/:userId", async (req, res) => {
  const { userId } = req.params;
  const { recommendationText, relevance, applied, date } = req.body;

  try {
    const result = await RecommendationModel.findOneAndUpdate(
      {
        userId,
        "recommendations.text": recommendationText,
        "recommendations.type": "daily",
        "recommendations.source": "combined",
        "recommendations.date": {
          $gte: new Date(`${date}T00:00:00.000Z`),
          $lte: new Date(`${date}T23:59:59.999Z`),
        },
      },
      {
        $set: {
          "recommendations.$.feedback": {
            relevance,
            applied,
          },
        },
      },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({ message: "המלצה לא נמצאה" });
    }

    res.json({ success: true, updated: result });
  } catch (error) {
    console.error("❌ שגיאה בעדכון משוב:", error);
    res.status(500).json({ message: "שגיאה בשרת" });
  }
});

module.exports = router;
