const mongoose = require("mongoose");

const recommendationSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  pattern: { type: String },
  recommendations: [
    {
      text: { type: String, required: true },
      source: { type: String, enum: ["algorithm", "openai"], required: true },
      type: { type: String, enum: ["general", "daily"], required: true },
      date: { type: Date, default: Date.now },
      feedback: {
        relevance: String,
        applied: String
      }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model("Recommendation", recommendationSchema);
