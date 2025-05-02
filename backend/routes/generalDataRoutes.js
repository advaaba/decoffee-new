const express = require("express");
const router = express.Router();
const {
  updateCoffeeSurvey,
  getSurveyByUserId,
} = require("../controllers/generalDataController");

router.post("/update-survey/:userId", updateCoffeeSurvey);
router.get("/get-survey/:userId", getSurveyByUserId); // ← חשוב!

module.exports = router;
