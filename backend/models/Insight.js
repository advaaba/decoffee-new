const mongoose = require("mongoose");

const insightSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  pattern: { type: String },
  insights: [
    {
      text: { type: String, required: true },
      source: { type: String, enum: ["algorithm", "openai"], required: true },
      type: { type: String, enum: ["general", "daily"], required: true },
      date: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model("Insight", insightSchema);
