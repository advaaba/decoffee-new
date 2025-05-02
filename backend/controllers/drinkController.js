const Drink = require("../models/Drink");

// שליפת כל המשקאות
exports.getAllDrinks = async (req, res) => {
  try {
    const drinks = await Drink.find();
    res.status(200).json(drinks);
  } catch (error) {
    res.status(500).json({ error: "שגיאה בשליפת המשקאות" });
  }
};
