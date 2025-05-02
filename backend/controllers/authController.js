const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
// const {
//   generateInsights,
//   generateRecommendations,
// } = require("../algorithms/prediction");
// const { initialBehaviorModel } = require('../analysis/initialBehaviorModel');

const SECRET_KEY = process.env.JWT_SECRET || "03122002";

// const getInsights = async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const user = await User.findOne({ userId });
//     // const tfMessage = await initialBehaviorModel(user);
//     // console.log("🎯 tfMessage שנשלח:", tfMessage);

//     if (!user) {
//       return res.status(404).json({ message: "❌ המשתמש לא נמצא" });
//     }
//     const insights = generateInsights(user.coffeeConsumption);
//     const recommendations = generateRecommendations(user.coffeeConsumption);

//     res.status(200).json({ insights, recommendations });
//   } catch (error) {
//     console.error("❌ שגיאה בהפקת תובנות:", error.message);
//     res.status(500).json({ message: "❌ שגיאה בשרת", error: error.message });
//   }
// };

const registerUser = async (req, res) => {
  try {
    const {
      userId,
      firstName,
      lastName,
      email,
      password,
      birthDate,
      weight,
      height,
      gender,
      phoneNumber,
      age,
      healthCondition,
      activityLevel,
      dietaryPreferences,
      caffeineRecommendationMin,
      caffeineRecommendationMax,
      pregnant,
      averageCaffeineRecommendation,
      customHealthDescription,
      customDietaryPreference,
    } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "⚠ המשתמש כבר קיים במערכת" });
    }

    if (
      !userId ||
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !birthDate ||
      !age ||
      !weight ||
      !height ||
      !gender ||
      !phoneNumber
    ) {
      return res
        .status(400)
        .json({ success: false, message: "⚠ אנא מלאי את כל השדות החיוניים" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      userId,
      firstName,
      lastName,
      email,
      password: hashedPassword,
      birthDate,
      age,
      weight,
      height,
      gender,
      phoneNumber,
      healthCondition,
      activityLevel,
      dietaryPreferences,
      caffeineRecommendationMin,
      caffeineRecommendationMax,
      pregnant,
      averageCaffeineRecommendation,
      customHealthDescription,
      customDietaryPreference,
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: "✅ המשתמש נרשם בהצלחה!",
      user: newUser,
    });
  } catch (err) {
    console.error("❌ שגיאה בהרשמה:", err.message, err);
    res.status(500).json({
      success: false,
      message: "❌ שגיאה בהרשמה",
      error: err.message,
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "❌ המשתמש לא נמצא במערכת" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "❌ סיסמה שגויה" });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.json({
      success: true,
      message: "✅ התחברת בהצלחה!",
      token,
      user,
    });
  } catch (error) {
    console.error("❌ שגיאה בהתחברות:", error);
    res.status(500).json({ success: false, message: "❌ שגיאה בהתחברות" });
  }
};


// בדיקה אם המשתמש קיים לפי אימייל ותעודת זהות
const checkUser = async (req, res) => {
  try {
    const { email, idNumber } = req.body;

    const user = await User.findOne({ email, idNumber });

    if (!user) {
      return res.status(404).json({ success: false, message: "❌ המשתמש לא נמצא" });
    }

    res.json({ success: true, message: "✅ המשתמש קיים במערכת" });
  } catch (error) {
    console.error("❌ שגיאה באימות משתמש:", error.message);
    res.status(500).json({ success: false, message: "❌ שגיאה בשרת", error: error.message });
  }
};


// איפוס סיסמה
const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res
        .status(400)
        .json({ success: false, message: "❌ חסר אימייל או סיסמה חדשה" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "❌ המשתמש לא נמצא" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ success: true, message: "✅ הסיסמה אופסה בהצלחה" });
  } catch (error) {
    console.error("❌ שגיאה באיפוס סיסמה:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "❌ שגיאה באיפוס סיסמה",
        error: error.message,
      });
  }
};

const savePushToken = async (req, res) => {
  const { userId, expoPushToken } = req.body;

  try {
    const user = await User.findOne({ userId });

    if (!user) {
      return res.status(404).json({ success: false, message: "❌ המשתמש לא נמצא" });
    }

    user.expoPushToken = expoPushToken;
    await user.save();

    res.json({ success: true, message: "✅ הטוקן נשמר בהצלחה" });
  } catch (error) {
    console.error("❌ שגיאה בשמירת Expo Token:", error);
    res.status(500).json({ success: false, message: "❌ שגיאה בשרת" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  // getInsights,
  checkUser,
  resetPassword,
  savePushToken,
};
