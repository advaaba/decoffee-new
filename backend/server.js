require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
// const helmet = require('helmet');

// בדיקה מוקדמת
if (!process.env.MONGO_URI) {
  console.error("❌ לא הוגדר MONGO_URI בקובץ הסביבה");
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;

// 🔐 Middleware
app.use(cors());
// app.use(helmet());
app.use(express.json());

// 📦 ראוטים
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/drinks', require('./routes/drinkRoutes'));
app.use('/api/dailyData', require('./routes/dailyDataRoutes'));
app.use('/api/generalData', require('./routes/generalDataRoutes'));
app.use('/api/pattern', require('./routes/patternRoutes'));
app.use('/api/dailypattern', require('./routes/dailyPatternRoutes'));

// 🧪 בדיקת חיות
app.get('/', (req, res) => {
  res.send('🚀 Server is running!');
});

// 🔗 חיבור למסד הנתונים
console.log("🔍 מנסה להתחבר ל־MongoDB...");
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('✅ MongoDB מחובר בהצלחה'))
  .catch(err => {
    console.error('❌ שגיאה בחיבור ל־MongoDB:', err);
    process.exit(1);
  });

// ▶️ הפעלת השרת
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
});
