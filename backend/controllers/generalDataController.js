const CoffeeSurvey = require("../models/GeneralData");

const updateCoffeeSurvey = async (req, res) => {
  try {
    const { userId } = req.params;
    const surveyData = req.body;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "❌ חסר מזהה משתמש" });
    }

    // בדיקה אם כבר קיימת סקירה עבור המשתמש
    const existingSurvey = await CoffeeSurvey.findOne({ userId });

    if (existingSurvey) {
      // עדכון הסקירה הקיימת
      await CoffeeSurvey.updateOne({ userId }, surveyData);
      return res.json({ success: true, message: "✅ הסקירה עודכנה בהצלחה" });
    }

    // אם לא קיימת – יצירה חדשה
    const newSurvey = new CoffeeSurvey({ userId, ...surveyData });
    await newSurvey.save();

    res.status(201).json({ success: true, message: "✅ הסקירה נשמרה בהצלחה" });
  } catch (error) {
    console.error("❌ שגיאה בעדכון/שמירת הסקירה:", error);
    res
      .status(500)
      .json({ success: false, message: "❌ שגיאה בשרת", error: error.message });
  }
};
const getSurveyByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const survey = await CoffeeSurvey.findOne({ userId });

    if (!survey) {
      return res
        .status(404)
        .json({ success: false, message: "❌ סקירה לא נמצאה" });
    }

    res.status(200).json({ success: true, survey });
  } catch (error) {
    console.error("❌ שגיאה בשליפת הסקירה:", error);
    res
      .status(500)
      .json({ success: false, message: "❌ שגיאה בשרת", error: error.message });
  }
};

module.exports = { updateCoffeeSurvey, getSurveyByUserId };
