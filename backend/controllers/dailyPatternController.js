const { OpenAI } = require("openai");
const DailyDataModel = require("../models/DailyData");
const InsightModel = require("../models/Insight");
const RecommendationModel = require("../models/Recommendation");
const { analyzeDailyPattern } = require("../analysis/dailyPattern");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

exports.analyzeAndSaveDailyPattern = async (req, res) => {
  try {
    const userId = String(req.body.userId);
    const date = req.body.date;

    const dailyData = await DailyDataModel.findOne({ userId, date });
    if (!dailyData) {
      return res.status(404).json({ success: false, error: "סקירה יומית לא נמצאה" });
    }

    // ניתוח באלגוריתם שלך
    const { pattern, insight, recommendation } = analyzeDailyPattern(dailyData);

    // ניתוח GPT
    let gptInsight = "";
    let gptRecommendation = "";

    const gptPrompt = `
נתונים יומיים של משתמש:
- מצב רוח: ${dailyData.mood}
- עייפות: ${dailyData.tirednessLevel}
- ריכוז: ${dailyData.focusLevel}
- שינה: ${dailyData.sleepHours} שעות
${dailyData.drankCoffee
  ? `- שתה קפה: כן | סוג: ${dailyData.coffeeDetails?.type} | סיבה: ${dailyData.coffeeDetails?.reason}`
  : `- לא שתה קפה | סיבה: ${dailyData.noCoffeeDetails?.reason}`}
    
בהתבסס על הנתונים, תן תובנה פסיכולוגית קצרה והמלצה התנהגותית אחת לשיפור ההרגלים. כתוב בעברית.
`;

    try {
      const gptResponse = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: gptPrompt }],
        temperature: 0.3,
      });

      const gptText = gptResponse.choices[0].message.content;
      const match = gptText.match(/תובנה:([\s\S]*?)המלצה:([\s\S]*)/i);
      if (match) {
        gptInsight = match[1].trim();
        gptRecommendation = match[2].trim();
      } else {
        gptInsight = gptText.trim(); // fallback: כל הטקסט כתובנה
      }
    } catch (gptErr) {
      console.error("❌ שגיאה בשימוש ב־OpenAI:", gptErr);
    }

    // שילוב בין שני המקורות
    const finalInsight = `${insight} בנוסף, ${gptInsight}`;
    const finalRecommendation = `${recommendation} בנוסף, ${gptRecommendation}`;

    console.log("🧠 finalInsight:", finalInsight);
    console.log("🎯 finalRecommendation:", finalRecommendation);

    // שמירה למסד
    await InsightModel.findOneAndUpdate(
      { userId },
      {
        $push: {
          insights: [
            { text: insight, type: "daily", source: "algorithm" },
            { text: gptInsight, type: "daily", source: "openai" },
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
            { text: gptRecommendation, type: "daily", source: "openai" },
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
    console.error("❌ שגיאה באבחון יומי:", error);
    res.status(500).json({ success: false, error: "שגיאה באבחון הדפוס היומי" });
  }
};

exports.getDailyInsightsAndRecommendations = async (req, res) => {
  try {
    const userId = String(req.params.userId);

    const insightDoc = await InsightModel.findOne({ userId });
    const recommendationDoc = await RecommendationModel.findOne({ userId });

    const insights = (insightDoc?.insights || []).filter(
      (i) => typeof i === "object" && i.type === "daily"
    );

    const recommendations = (recommendationDoc?.recommendations || []).filter(
      (r) => typeof r === "object" && r.type === "daily"
    );

    res.status(200).json({ insights, recommendations });
  } catch (error) {
    console.error("❌ שגיאה בשליפת נתוני דפוס יומי:", error);
    res.status(500).json({ success: false, error: "שגיאה בשליפת הנתונים" });
  }
};
