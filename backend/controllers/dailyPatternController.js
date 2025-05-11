const { OpenAI } = require("openai");
const DailyDataModel = require("../models/DailyData");
const InsightModel = require("../models/Insight");
const RecommendationModel = require("../models/Recommendation");
const { traverseTree, dailyDecisionTree } = require("../analysis/dailyPattern");
const GeneralDataModel = require("../models/GeneralData");
const UserModel = require("../models/User");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

exports.analyzeAndSaveDailyPattern = async (req, res) => {
  try {
    const userId = String(req.body.userId);
    const date = req.body.date;

    const dailyData = await DailyDataModel.findOne({ userId, date });
    if (!dailyData) {
      return res
        .status(404)
        .json({ success: false, error: "סקירה יומית לא נמצאה" });
    }
    const generalData = await GeneralDataModel.findOne({ userId });
    const user = await UserModel.findOne({ userId });

    const {
      traverseTree,
      dailyDecisionTree,
    } = require("../analysis/dailyPattern");
    const { pattern, insight, recommendation } = traverseTree(
      dailyDecisionTree,
      {
        ...dailyData.toObject(),
        generalData: generalData?.toObject?.() || {},
        user: user?.toObject?.() || {},
      }
    );

    const gptPrompt = `
נתונים יומיים של משתמש:
- מצב רוח: ${dailyData.mood || "לא צויין"}
- עייפות: ${dailyData.tirednessLevel || "לא צויין"}
- ריכוז: ${dailyData.focusLevel || "לא צויין"}
- שינה: ${dailyData.sleepHours || "לא צויין"} שעות
${
  dailyData.drankCoffee
    ? `- שתה קפה: כן | סוג: ${
        dailyData.coffeeDetails?.type || "לא צויין"
      } | סיבה: ${dailyData.coffeeDetails?.reason || "לא צויינה"}`
    : `- לא שתה קפה | סיבה: ${dailyData.noCoffeeDetails?.reason || "לא צויינה"}`
}

בהתבסס על הנתונים, כתוב תובנה פסיכולוגית אחת והמלצה התנהגותית אחת בלבד.
פורמט הפלט:
תובנה: ...
המלצה: ...
ענה בעברית בלבד.
`;

    let gptInsight = "";
    let gptRecommendation = "";

    try {
      const gptResponse = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: gptPrompt }],
        temperature: 0.3,
      });

      const gptText = gptResponse.choices[0].message.content.trim();
      const match = gptText.match(/תובנה:\s*(.+?)\s*המלצה:\s*(.+)/s);
      if (match) {
        gptInsight = match[1].trim();
        gptRecommendation = match[2].trim();
      } else {
        gptInsight = gptText;
      }
    } catch (err) {
      console.error("❌ שגיאה בשימוש ב־OpenAI:", err.message);
    }

    const finalInsight = `${insight}${
      gptInsight ? " בנוסף, " + gptInsight : ""
    }`;
    const finalRecommendation = `${recommendation}${
      gptRecommendation ? " בנוסף, " + gptRecommendation : ""
    }`;

    await InsightModel.findOneAndUpdate(
      { userId },
      {
        $push: {
          insights: [
            { text: insight, type: "daily", source: "algorithm" },
            ...(gptInsight
              ? [{ text: gptInsight, type: "daily", source: "openai" }]
              : []),
            { text: finalInsight, type: "daily", source: "combined" },
          ],
        },
        $set: { pattern },
        $setOnInsert: { userId },
      },
      { upsert: true, new: true }
    );

    await RecommendationModel.findOneAndUpdate(
      { userId },
      {
        $push: {
          recommendations: [
            { text: recommendation, type: "daily", source: "algorithm" },
            ...(gptRecommendation
              ? [{ text: gptRecommendation, type: "daily", source: "openai" }]
              : []),
            { text: finalRecommendation, type: "daily", source: "combined" },
          ],
        },
        $set: { pattern },
        $setOnInsert: { userId },
      },
      { upsert: true, new: true }
    );

    res.status(200).json({
      success: true,
      pattern,
      insights: [finalInsight],
      recommendations: [{ text: finalRecommendation }],
    });
  } catch (error) {
    console.error("❌ שגיאה באבחון דפוס יומי:", error);
    res.status(500).json({ success: false, error: "שגיאה באבחון הדפוס היומי" });
  }
};

exports.getDailyInsightsAndRecommendations = async (req, res) => {
  try {
    const userId = String(req.params.userId);
    const { date } = req.query;

    const insightDoc = await InsightModel.findOne({ userId });
    const recommendationDoc = await RecommendationModel.findOne({ userId });

    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const insights = (insightDoc?.insights || []).filter((i) => {
      const d = new Date(i.date);
      return i.type === "daily" && d >= start && d <= end;
    });

    const recommendations = (recommendationDoc?.recommendations || []).filter(
      (r) => {
        const d = new Date(r.date);
        return r.type === "daily" && d >= start && d <= end;
      }
    );

    res.status(200).json({ insights, recommendations });
  } catch (error) {
    console.error("❌ שגיאה בשליפת נתוני דפוס יומי:", error);
    res
      .status(500)
      .json({ success: false, error: "שגיאה בשליפת התובנות או ההמלצות" });
  }
};

exports.getDailyHistory = async (req, res) => {
  try {
    const userId = String(req.params.userId);

    const insightDoc = await InsightModel.findOne({ userId });
    const recommendationDoc = await RecommendationModel.findOne({ userId });

    const insights = (insightDoc?.insights || []).filter(
      (i) => i.type === "daily"
    );
    const recommendations = (recommendationDoc?.recommendations || []).filter(
      (r) => r.type === "daily"
    );

    res.status(200).json({ insights, recommendations });
  } catch (error) {
    console.error("❌ שגיאה בשליפת היסטוריית תובנות יומיות:", error);
    res.status(500).json({ success: false, error: "שגיאה בשליפה" });
  }
};
