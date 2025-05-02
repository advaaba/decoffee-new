const express = require('express');
const router = express.Router();
const DailyData = require('../models/dailyData');
const { createDailyEntry, getDailyEntryByDate, updateDailyEntry } = require('../controllers/dailyDataController');

router.post('/', createDailyEntry);
router.get('/by-date/:userId', getDailyEntryByDate);
router.put('/:id', updateDailyEntry);
router.get('/check', async (req, res) => {
    const { userId, date } = req.query;
  
    try {
      const existingEntry = await DailyData.findOne({ userId, date });
      
      if (existingEntry) {
        return res.json({ exists: true });
      } else {
        return res.json({ exists: false });
      }
    } catch (error) {
      console.error('❌ שגיאה בבדיקת הסקירה היומית:', error);
      return res.status(500).json({ success: false, message: 'שגיאה בבדיקת הסקירה היומית' });
    }
  });

module.exports = router;
