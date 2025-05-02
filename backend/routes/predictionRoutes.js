const express = require("express");
const router = express.Router();
const { analyzeInitialPattern } = require("../algorithms/prediction");
router.post("/analyze", (req, res) => {
    console.log("📥 התקבלה בקשה עם הנתונים:", req.body);
    try {
      const result = analyzeInitialPattern(req.body);
      console.log("📤 מחזירה תוצאה:", result);
      res.status(200).json(result);
    } catch (err) {
      console.error("❌ שגיאה בהרצת האלגוריתם:", err.stack || err);
      res.status(500).json({ error: "שגיאה בניתוח" });
    }
  });
  

module.exports = router;
