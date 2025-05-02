const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  // updateCoffeeConsumption,
  // getInsights,
  checkUser,
  resetPassword
} = require('../controllers/authController');
const User = require('../models/User');
router.put('/save-push-token', require('../controllers/authController').savePushToken);

// רישום והתחברות
router.post('/register', registerUser);
router.post('/login', loginUser);

// שליפת פרטי משתמש
router.get('/get-user/:userId', async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.params.userId });
    if (!user) {
      return res.status(404).json({ success: false, message: "משתמש לא נמצא" });
    }
    res.json({ success: true, user });
  } catch (err) {
    console.error("❌ שגיאה בשליפת משתמש:", err);
    res.status(500).json({ success: false, message: "שגיאה בשרת" });
  }
});

// 🔄 עדכון כללי של פרטי משתמש
router.put('/update-user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const updatedUser = await User.findOneAndUpdate(
      { userId },
      req.body,
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "משתמש לא נמצא" });
    }

    res.json({ success: true, user: updatedUser });
  } catch (err) {
    console.error("❌ שגיאה בעדכון משתמש:", err);
    res.status(500).json({ success: false, message: "שגיאה בעדכון" });
  }
});

// 📊 שליפת תובנות מהאלגוריתם
// router.get('/get-insights/:userId', getInsights);
router.post('/checkUser', checkUser);
router.post('/resetPassword', resetPassword);
module.exports = router;
