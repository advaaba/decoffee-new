function generateInsights(user) {
  const insights = [];

  // 1. צריכת קפאין
  if (user.averageCaffeinePerDay > user.caffeineRecommendationMax) {
    insights.push(
      " צריכת הקפאין שלך גבוהה מהמומלץ. שקול/י להפחית או להחליף חלק מהכוסות."
    );
  } else if (user.averageCaffeinePerDay < user.caffeineRecommendationMin) {
    insights.push(
      " את/ה צורך/ת פחות קפאין מהמינימום – אם את/ה מרגיש/ה טוב, זה נהדר."
    );
  } else {
    insights.push(" צריכת הקפאין שלך מאוזנת לפי ההמלצות עבורך.");
  }

  // 2. השפעות הקפה
  switch (user.effects) {
    case "physically":
      insights.push(
        " הקפה משפיע עליך פיזית – כדאי לבדוק אם זה מעורר או אולי גורם לתחושות לא נעימות."
      );
      break;
    case "mentally":
      insights.push(" הקפה משפיע עליך מנטלית – אולי משפר ריכוז או מצב רוח.");
      break;
    case "both":
      insights.push(
        " הקפה משפיע גם פיזית וגם מנטלית – חשוב לשים לב למינון ולעיתוי."
      );
      break;
    default:
      insights.push(
        " לא צוינה השפעה – שווה לשים לב איך את/ה מרגיש/ה אחרי שתייה."
      );
  }

  // 3. שעות שינה
  if (user.sleepDurationAverage < 6) {
    insights.push(
      " את/ה ישן/ה פחות מדי – שווה לבדוק אם שתיית הקפה מאוחרת מדי או משפיעה על איכות השינה."
    );
  } else if (user.sleepDurationAverage > 9) {
    insights.push(
      " את/ה ישן/ה הרבה – האם הקפה עוזר להתעורר, או שהוא שתייה מתוך הרגל?"
    );
  } else {
    insights.push(" זמן השינה שלך מאוזן.");
  }

  // 4. מוטיבציה והפחתה
  if (user.isTryingToReduce === "yes") {
    insights.push(
      " מעולה שאת/ה מנסה להפחית. עקוב/י אחרי ההשפעה על ההרגשה האישית."
    );
  } else if (user.isMotivation === true && user.isTryingToReduce === "no") {
    insights.push(
      " נראה שיש לך מוטיבציה לעקוב אחרי ההרגלים שלך – אולי שווה לשקול הפחתה קלה."
    );
  } else {
    insights.push(
      " את/ה לא מנסה להפחית – וזה בסדר גמור, כל עוד את/ה מרגיש/ה טוב עם ההרגלים שלך."
    );
  }

  // 5. תיאור אישי
  if (user.selfDescription?.includes("שקט")) {
    insights.push(
      " הקפה עבורך הוא טקס אישי מרגיע – אולי תשלב/י עוד טקסים כאלה ביום?"
    );
  }
  if (user.selfDescription?.includes("הרגל")) {
    insights.push(
      " הקפה אצלך הפך להרגל – שווה לבדוק אם הוא באמת עוזר או פשוט משהו אוטומטי."
    );
  }
  if (user.selfDescription === "other" && user.customDescription?.trim()) {
    insights.push(
      " תיאור אישי מותאם – זה מעולה! זה יעזור לדייק עבורך המלצות."
    );
  }

  // 6. שעות קפה מול עבודה
  const timeRangeMap = {
    Morning: { from: 6, to: 11.99 },
    Afternoon: { from: 12, to: 16 },
    evening: { from: 16.01, to: 21 },
    night: { from: 21.01, to: 29.99 }, // חישוב לילה: 21:01 עד 5:59 = 21.01 עד 5.99 + 24
  };

  if (
    user.isWorking === "yes" &&
    user.workStartHour != null &&
    user.workEndHour != null
  ) {
    const start = user.workStartHour;
    const end = user.workEndHour;

    const workRange =
      start < end ? { from: start, to: end } : { from: start, to: end + 24 }; // למשל: מ־22 עד 6 → 22 עד 30

    if (start === end) {
      insights.push(
        " הזנת אותה שעה לתחילת וסיום עבודה – אולי כדאי לבדוק שוב."
      );
    } else {
      user.consumptionTime?.forEach((label) => {
        const drinkRange = timeRangeMap[label];
        if (!drinkRange) return;

        // אם לילה – נוסיף 24 לסיום כדי לא לשבור את ההשוואה
        const adjustedDrinkRange =
          label === "night"
            ? { from: drinkRange.from, to: drinkRange.to }
            : drinkRange;

        const overlap = isRangeOverlap(workRange, adjustedDrinkRange);

        if (overlap) {
          insights.push(
            ` שות/ה קפה ב־${label} (${drinkRange.from}:00–${drinkRange.to}:00) – במהלך שעות העבודה.`
          );
        } else {
          insights.push(
            ` שות/ה קפה ב־${label} (${drinkRange.from}:00–${drinkRange.to}:00), מחוץ לשעות העבודה.`
          );
        }
      });
    }
  }

  return [...new Set(insights)];
}

function generateRecommendations(user) {
  const recs = [];

  if (user.averageCaffeinePerDay > user.caffeineRecommendationMax) {
    recs.push(" נסה להפחית כוס אחת ביום או להחליף לקפה נטול קפאין.");
  }

  if (
    user.effects === "physically" &&
    user.consumptionTime?.includes("night")
  ) {
    recs.push(" הימנע משתיית קפה בלילה – נסה תה קמומיל במקום.");
  }

  if (user.sleepDurationAverage < 6) {
    recs.push(" שפר את איכות השינה – הגבֵר שינה ושתה פחות קפה בשעות ערב.");
  }

  if (user.isTryingToReduce === "no" && user.isMotivation) {
    recs.push(
      " התחל בקטן – נסה להפחית כוס אחת או להחליף את קפה הצהריים בתה ירוק."
    );
  }

  if (user.selfDescription?.includes("שקט")) {
    recs.push(
      " נסה להכניס עוד טקסי שקט כמו מדיטציה או הליכה קצרה – זה עשוי להוריד את הצורך בקפה."
    );
  }

  return recs;
}
function isRangeOverlap(range1, range2) {
  return range1.from <= range2.to && range2.from <= range1.to;
}

// decision tree based on the user's data
function generateInsightsTreeBased(user) {
  // שלב 1 – קפאין
  if (user.averageCaffeinePerDay > user.caffeineRecommendationMax) {
    if (user.consumptionTime?.includes("night")) {
      return " צריכת קפאין גבוהה וגם שתייה בלילה – נסה להפחית ולשתות מוקדם יותר.";
    } else if (user.effects === "physically") {
      return " צריכה גבוהה + השפעה פיזית – שים לב להשפעות גופניות ונסה להפחית בהדרגה.";
    } else {
      return " צריכת הקפאין גבוהה – שקול/י להחליף לפחות כוס אחת בקפה דל קפאין.";
    }
  }

  // שלב 2 – שינה
  if (user.sleepDurationAverage < 6) {
    if (
      user.consumptionTime?.includes("evening") ||
      user.consumptionTime?.includes("night")
    ) {
      return " את/ה ישן/ה מעט ושותה קפה בערב – אולי הקפה משפיע על איכות השינה.";
    } else {
      return " זמן שינה קצר – כדאי לבדוק אם מדובר בלחץ, הרגל או צורך בקפה.";
    }
  }

  // 3.5 – עומס עבודה והשפעה אפשרית על הרגלי הקפה
  if (
    user.workDurationAverage >= 10 &&
    user.averageCaffeinePerDay > user.caffeineRecommendationMax
  ) {
    insights.push(
      " את/ה עובד/ת שעות ארוכות ושותה הרבה קפה – שקול/י לבדוק אם זה הרגל תגובתי לעומס."
    );
  }

  // שלב 3 – הפחתה ומוטיבציה
  if (user.isTryingToReduce === "yes") {
    return " מעולה שאת/ה מנסה להפחית – המשיכ/י לעקוב אחרי התחושות.";
  } else if (user.isMotivation) {
    return " יש לך מוטיבציה לעקוב – אולי שווה לבדוק הפחתה הדרגתית?";
  }

  // שלב 4 – השפעות
  if (user.effects === "both") {
    return " הקפה משפיע גם פיזית וגם מנטלית – חשוב לשים לב למינון ולעיתוי.";
  } else if (user.effects === "physically") {
    return " הקפה משפיע עליך פיזית – עקוב/י אחרי התחושות לאחר השתייה.";
  } else if (user.effects === "mentally") {
    return " הקפה משפיע מנטלית – ייתכן שהוא מסייע בריכוז או משפר מצב רוח.";
  }

  // שלב 5 – תיאור אישי
  if (user.selfDescription?.includes("שקט")) {
    return " הקפה הוא טקס שקט – שקול/י לשלב עוד טקסים כאלה שמרגיעים אותך במהלך היום.";
  }
  if (user.selfDescription?.includes("הרגל")) {
    return " הקפה אצלך הפך להרגל – אולי כדאי לבדוק אם הוא עדיין משרת אותך.";
  }

  // ברירת מחדל
  return " הצריכה שלך נראית תקינה – המשיכ/י לעקוב וליהנות מהקפה במידה.";
}

function generateRecommendationsTreeBased(user) {
  // שלב 1 – קפאין גבוה
  if (user.averageCaffeinePerDay > user.caffeineRecommendationMax) {
    if (user.consumptionTime?.includes("night")) {
      return " שתיית קפה בלילה + צריכה גבוהה – נסה להימנע משתייה אחרי 16:00 או לעבור לתה קמומיל.";
    } else {
      return " צריכה גבוהה – נסה להחליף כוס אחת ביום בקפה נטול קפאין או תה ירוק.";
    }
  }

  // שלב 2 – שינה לא מספיקה
  if (user.sleepDurationAverage < 6) {
    return " נסה לשפר את איכות השינה – הקפד על שעות קבועות והפחת קפה בערב.";
  }

  // שלב 3 – תיאור אישי מרגיע
  if (user.selfDescription?.includes("שקט")) {
    return " שקול/י להוסיף עוד טקסים שקטים ומרגיעים (כמו מדיטציה או הליכה), כדי להפחית תלות בקפה.";
  }
  // המלצה על רקע עומס עבודה
  if (
    user.workDurationAverage >= 10 &&
    user.averageCaffeinePerDay > user.caffeineRecommendationMax
  ) {
    recs.push(
      " עומס עבודה גבוה עלול להוביל לשתיית יתר – נסה לקחת הפסקות קצרות בלי קפה, כמו הליכה או נשימות."
    );
  }

  // שלב 4 – השפעה פיזית בלילה
  if (
    user.effects === "physically" &&
    user.consumptionTime?.includes("night")
  ) {
    return " הקפה משפיע עליך פיזית ושותה בלילה – נסה להקדים את הקפה או לצמצם בלילה.";
  }

  // שלב 5 – יש מוטיבציה, אין הפחתה
  if (user.isTryingToReduce === "no" && user.isMotivation) {
    return " התחלת שינוי נראית קרובה – נסה להפחית כוס אחת בצהריים ולבחון איך זה מרגיש.";
  }

  // ברירת מחדל
  return " לא נדרשת כרגע פעולה – המשיכ/י לעקוב אחרי ההשפעה של הקפה עליך.";
}

function analyzeInitialPattern(user) {
  const insight = generateInsightsTreeBased(user);
  const recommendation = generateRecommendationsTreeBased(user);

  return {
    insight,
    recommendation,
  };
}

module.exports = {
  generateInsights,
  generateRecommendations,
  generateInsightsTreeBased,
  generateRecommendationsTreeBased,
  analyzeInitialPattern,
};
