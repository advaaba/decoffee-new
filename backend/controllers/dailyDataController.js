const DailyData = require('../models/dailyData');


const createDailyEntry = async (req, res) => {
  try {
    const {
      userId,
      date,
      sleepHours,
      mood,
      focusLevel,
      tirednessLevel,
      drankCoffee,
      coffeeDetails,
      noCoffeeDetails,
    } = req.body;

    const newEntry = new DailyData({
      userId,
      date,
      sleepHours,
      mood,
      focusLevel,
      tirednessLevel,
      drankCoffee,
      coffeeDetails,
      noCoffeeDetails,
    });

    await newEntry.save();

    res.status(201).json({ success: true, message: "✅ נתוני היום נשמרו בהצלחה!", data: newEntry });
  } catch (error) {
    console.error("❌ שגיאה בשמירת נתוני יומיום:", error);
    res.status(500).json({ success: false, message: "❌ שגיאה בשמירה", error: error.message });
  }
};


const getDailyEntryByDate = async (req, res) => {
  const { userId } = req.params;
  const { date } = req.query;

  try {
    const entry = await DailyData.findOne({ userId, date });
    if (!entry) {
      return res.status(404).json({ message: "לא נמצאה סקירה ליום זה." });
    }

    res.json(entry);
  } catch (error) {
    console.error("❌ שגיאה בשליפת סקירה יומית:", error);
    res.status(500).json({ message: "שגיאה בשליפה", error: error.message });
  }
};

const updateDailyEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const updatedEntry = await DailyData.findByIdAndUpdate(id, updatedData, {
      new: true, // מחזיר את המסמך לאחר העדכון
      runValidators: true,
    });

    if (!updatedEntry) {
      return res.status(404).json({ success: false, message: "סקירה יומית לא נמצאה." });
    }

    res.status(200).json({ success: true, message: "✅ הסקירה עודכנה בהצלחה!", data: updatedEntry });
  } catch (error) {
    console.error("❌ שגיאה בעדכון הסקירה:", error);
    res.status(500).json({ success: false, message: "שגיאה בעדכון הסקירה", error: error.message });
  }
};

module.exports = { createDailyEntry, getDailyEntryByDate, updateDailyEntry };
