const { OpenAI } = require("openai");
const InsightModel = require("../models/Insight");
const RecommendationModel = require("../models/Recommendation");
const UserModel = require("../models/User");
const GeneralDataModel = require("../models/GeneralData");
const { runInitialAnalysis } = require("../analysis/initialPattern");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

exports.analyzeAndSaveUserPattern = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await UserModel.findOne({ userId });
    const general = await GeneralDataModel.findOne({ userId });

    if (!user || !general) {
      return res
        .status(404)
        .json({ success: false, error: "משתמש או נתוני סקר לא נמצאו" });
    }

    const userData = {
      userId,
      weight: user.weight,
      gender: user.gender,
      activityLevel: user.activityLevel,
      pregnant: user.pregnant,
      healthCondition: user.healthCondition,
      dietaryPreferences: user.dietaryPreferences,
      workDurationAverage: general.workDurationAverage,
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

    const prompt = `
בהתבסס על נתוני המשתמש הבאים:

${JSON.stringify(userData, null, 2)}

זהה את דפוס צריכת הקפה המתאים ביותר מהרשימה הבאה בלבד:
- morning_drinker  
- fatigue_based  
- fatigue_response  
- stress_drinker  
- high_intake  
- habitual  
- habitual_drinker  
- considered_but_avoided  
- trying_to_reduce  
- balanced  
- pregnancy_limit_exceeded  
- compensating_lifestyle  
- health_risk  
- avoidance_due_to_physical_effects  
- avoidance_due_to_mental_effects  
- conscious_no_coffee  
- no_coffee_unintentional  
- general_consumption  
- unknown

החזר תשובה בפורמט JSON בלבד, כך:
{
  "pattern": "<one_of_the_patterns>",
  "explanation": "<short_reason_in_hebrew>"
}

אין לתרגם או להוסיף מידע נוסף מעבר לכך.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    });

    const gptContent = response.choices[0].message.content;
    console.log("📦 פלט מ-GPT:", gptContent);

    const cleaned = gptContent.replace(/```json|```/g, "").trim();

    let parsedPattern;
    try {
      parsedPattern = JSON.parse(cleaned);
      if (!parsedPattern.pattern || !parsedPattern.explanation) {
        throw new Error("Missing keys in GPT response");
      }
    } catch (e) {
      console.error("❌ שגיאה בפענוח או חוסר מפתחות:", cleaned);
      return res
        .status(500)
        .json({ success: false, error: "שגיאה בניתוח הפלט מה-GPT" });
    }

    const { pattern, explanation } = parsedPattern;
    userData.pattern = pattern;
    const { insight, recommendation } = runInitialAnalysis(userData);

    const existingInsight = await InsightModel.findOne({
      userId,
      "insights.type": "general",
    });

    if (existingInsight) {
      await InsightModel.updateOne(
        { userId, "insights.type": "general" },
        { $set: { "insights.$.text": insight } }
      );
    } else {
      await InsightModel.updateOne(
        { userId },
        {
          $push: {
            insights: [
              { text: explanation, type: "gpt_explanation" },
              { text: insight, type: "general" },
            ],
          },
          $set: { pattern },
        },
        { upsert: true }
      );
    }
    const existingRecommendation = await RecommendationModel.findOne({
      userId,
      "recommendations.type": "general",
    });

    if (existingRecommendation) {
      await RecommendationModel.updateOne(
        { userId, "recommendations.type": "general" },
        { $set: { "recommendations.$.text": recommendation } }
      );
    } else {
      await RecommendationModel.updateOne(
        { userId },
        {
          $push: {
            recommendations: [{ text: recommendation, type: "general" }],
          },
          $set: { pattern },
        },
        { upsert: true }
      );
    }

    res.status(200).json({
      success: true,
      pattern,
      explanation,
      insights: [insight],
      recommendations: [{ text: recommendation }],
    });
  } catch (error) {
    console.error("❌ שגיאה בניתוח או שמירה:", error);
    res.status(500).json({ success: false, error: "שגיאה בניתוח הדפוס" });
  }
};

exports.getUserInsightsAndRecommendations = async (req, res) => {
  try {
    const { userId } = req.params;
    const type = req.query.type || "general";

    const insightDoc = await InsightModel.findOne({ userId });
    const recommendationDoc = await RecommendationModel.findOne({ userId });

    const insights = (insightDoc?.insights || []).filter(
      (i) => i.type === type
    );
    const recommendations = (recommendationDoc?.recommendations || []).filter(
      (r) => r.type === type
    );

    res.status(200).json({
      insights,
      recommendations,
      pattern: insightDoc?.pattern || null,
    });
  } catch (err) {
    console.error("❌ שגיאה בשליפת התובנות וההמלצות:", err);
    res.status(500).json({ error: "שגיאה בשליפת התובנות וההמלצות" });
  }
};
