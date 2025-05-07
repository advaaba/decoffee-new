const { OpenAI } = require("openai");
const InsightModel = require("../models/Insight");
const RecommendationModel = require("../models/Recommendation");
const UserModel = require("../models/User");
const GeneralDataModel = require("../models/GeneralData");
const { runInitialAnalysis } = require("../analysis/initialPattern");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// POST /api/pattern/analyze
exports.analyzeAndSaveUserPattern = async (req, res) => {
  try {
    const { userId } = req.body;

    // שלב 1: שליפת נתוני משתמש וסקירה כללית
    const user = await UserModel.findOne({ userId });
    const general = await GeneralDataModel.findOne({ userId });

    if (!user || !general) {
      return res
        .status(404)
        .json({ success: false, error: "משתמש או נתוני סקר לא נמצאו" });
    }

    // שלב 2: בניית אובייקט לניתוח
    const userData = {
      userId,
      averageCaffeinePerDay: general.averageCaffeinePerDay,
      caffeineRecommendationMin: user.caffeineRecommendationMin,
      caffeineRecommendationMax: user.caffeineRecommendationMax,
      consumptionTime: general.consumptionTime,
      sleepDurationAverage: general.sleepDurationAverage,
      effects: general.effects,
      isTryingToReduce: general.isTryingToReduce,
      reductionExplanation: general.reductionExplanation,
      selfDescription: general.selfDescription,
    };

    // שלב 3: ניתוח דפוס עם GPT
    const prompt = `
    Given the following user data:
    ${JSON.stringify(userData, null, 2)}

    Return ONLY the exact name (as-is) of the most suitable coffee drinking pattern from this list:
    - morning_drinker
    - fatigue_based
    - stress_drinker
    - habitual
    - balanced
    - unknown

    Do NOT explain. Do NOT translate. Just return one of the exact values above.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    });

    const pattern = response.choices[0].message.content
      .trim()
      .replace(/["']/g, "");
    userData.pattern = pattern;

    // שלב 4: הרצת האלגוריתם שלך
    const { insight, recommendation } = runInitialAnalysis(userData);

    // שלב 5: שמירת התובנות וההמלצות במסד עם מקור וסוג
  await InsightModel.findOneAndUpdate(
      { userId },
      {
        $push: {
          insights: [ { text: insight, type: "general" } ]
        },
        $set: { pattern: pattern },
        $setOnInsert: { userId },
      },
      { upsert: true, new: true }
    );

    await RecommendationModel.findOneAndUpdate(
      { userId },
      {
        $push: {
          recommendations: [
            { text: recommendation, type: "general" },
          ],
        },
        $set: { pattern: pattern },
        $setOnInsert: { userId },
      },
      { upsert: true, new: true }
    );
    

    // שלב 6: תגובה ללקוח
    res.status(200).json({
      success: true,
      pattern,
      insights: [insight],
      recommendations: [{ text: recommendation }],
    });
  } catch (error) {
    console.error("❌ שגיאה בניתוח או שמירה:", error);
    res.status(500).json({ success: false, error: "שגיאה בניתוח הדפוס" });
  }
};

// GET /api/pattern/get-insights/:userId
exports.getUserInsightsAndRecommendations = async (req, res) => {
  try {
    const { userId } = req.params;
    const type = req.query.type || "general";

    const insightDoc = await InsightModel.findOne({ userId, type });
    const recommendationDoc = await RecommendationModel.findOne({ userId, type });

    const insights = insightDoc?.insights || [];
    const recommendations = recommendationDoc?.recommendations || [];

    res.status(200).json({ insights, recommendations });
  } catch (err) {
    console.error("❌ שגיאה בשליפת התובנות וההמלצות:", err);
    res.status(500).json({ error: "שגיאה בשליפת התובנות וההמלצות" });
  }
};

