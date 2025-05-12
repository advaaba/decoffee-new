const express = require("express");
const router = express.Router();
const DailyData = require("../models/dailyData");
const {
  createDailyEntry,
  getDailyEntryByDate,
  updateDailyEntry,
  checkDailyEntryExists,
} = require("../controllers/dailyDataController");

router.post("/", createDailyEntry);
router.get("/by-date/:userId", getDailyEntryByDate);
router.put("/:id", updateDailyEntry);
router.get("/check", async (req, res) => {
  const { userId, date } = req.query;

  try {
    const existingEntry = await DailyData.findOne({ userId, date });

    if (existingEntry) {
      return res.json({ exists: true });
    } else {
      return res.json({ exists: false });
    }
  } catch (error) {
    console.error("❌ שגיאה בבדיקת הסקירה היומית:", error);
    return res
      .status(500)
      .json({ success: false, message: "שגיאה בבדיקת הסקירה היומית" });
  }
});

router.get('/get/:userId/:date', async (req, res) => {
  const { userId, date } = req.params;

  const startOfDay = new Date(date);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  try {
    const dailyData = await DailyData.findOne({
      userId,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    if (!dailyData) {
      return res.status(404).json({ success: false, message: "לא נמצאה סקירה יומית" });
    }

    return res.json({ success: true, dailyData });
  } catch (error) {
    console.error("❌ שגיאה בשליפת סקירה יומית:", error);
    return res.status(500).json({ success: false, message: "שגיאה בשרת" });
  }
});


module.exports = router;
