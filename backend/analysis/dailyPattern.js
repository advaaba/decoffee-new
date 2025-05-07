// dailyPatternEngine.js

function analyzeDailyPattern(dailyData) {
    const {
      drankCoffee,
      coffeeDetails,
      noCoffeeDetails,
      tirednessLevel,
      focusLevel,
      mood,
      sleepHours,
    } = dailyData;
  
    let pattern = "unknown";
    let insight = "";
    let recommendation = "";
  
    if (drankCoffee) {
      if (
        coffeeDetails.reason === "עייפות" ||
        tirednessLevel === "high" ||
        focusLevel === "low"
      ) {
        pattern = "stress_response";
        insight = "נראה שאת/ה שותה קפה כדי להתמודד עם עייפות או חוסר ריכוז.";
        recommendation = "שקול/י שיטות חלופיות כמו פעילות גופנית קלה או שתייה של מים קרים לפני קפה.";
      } else if (
        coffeeDetails.consumptionTime.includes("Morning") &&
        coffeeDetails.reason === "הרגל"
      ) {
        pattern = "routine_morning";
        insight = "הקפה הוא חלק מהשגרה שלך בבוקר.";
        recommendation = "אפשר לנסות טקס בוקר אחר מפעם לפעם – הליכה, מדיטציה או תה.";
      } else if (coffeeDetails.consideredReducing === "yes") {
        pattern = "trying_to_reduce";
        insight = "את/ה מנסה להפחית בצריכת הקפה.";
        recommendation = "הגדר/י מטרה קטנה להפחתה יומית והיעזר/י בחלופות בריאות יותר.";
      } else {
        pattern = "coffee_regular";
        insight = "שתית קפה היום בהתאם לשגרה הרגילה שלך.";
        recommendation = "אם את/ה מרגיש/ה טוב – המשיכ/י להקשיב לגוף.";
      }
    } else {
      if (noCoffeeDetails?.consciousDecision === "yes") {
        pattern = "no_coffee_by_choice";
        insight = "בחרת באופן מודע לא לשתות קפה היום.";
        recommendation = "יפה! אם הרגשת טוב – אולי אין צורך קבוע בקפה ביום-יום.";
      } else if (noCoffeeDetails?.wantToContinueNoCoffee === "yes") {
        pattern = "trying_to_stop";
        insight = "את/ה בוחנ/ת הימנעות קבועה משתיית קפה.";
        recommendation = "עקוב/י אחרי התחושות וההשפעות כדי להבין אם זה מתאים לאורך זמן.";
      } else {
        pattern = "no_need_detected";
        insight = "לא שתית קפה ולא הייתה לכך סיבה חריגה.";
        recommendation = "ייתכן שאינך זקוק/ה לקפה באופן קבוע – נהדר!";
      }
    }
  
    return {
      pattern,
      insight,
      recommendation,
    };
  }
  
  module.exports = { analyzeDailyPattern };
  