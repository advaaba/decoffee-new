const decisionTree = {
    question: (user) => user.averageCaffeinePerDay < user.caffeineRecommendationMin,
    yes: {
      question: (user) => user.consumptionTime.includes("Morning"),
      yes: {
        leaf: "morning_drinker"
      },
      no: {
        leaf: "balanced"
      }
    },
    no: {
      question: (user) => user.sleepDurationAverage < 6,
      yes: {
        question: (user) => user.averageCaffeinePerDay > user.caffeineRecommendationMax,
        yes: {
          leaf: "fatigue_based"
        },
        no: {
          leaf: "stress_drinker"
        }
      },
      no: {
        question: (user) => user.consumptionTime.length >= 2,
        yes: {
          leaf: "habitual"
        },
        no: {
          leaf: "unknown"
        }
      }
    }
  };

  const insightsAndRecommendations = {
    morning_drinker: {
      insight: "את/ה מתחיל/ה את היום עם קפה – אפשר לנסות טקס בוקר אחר כמו תה או הליכה קלה.",
      recommendation: "שלבי חלופה כמו תה ירוק כדי להפחית תלות בקפאין."
    },
    fatigue_based: {
      insight: "נראה שאת/ה שותה קפה בגלל עייפות – כדאי לבדוק את איכות השינה.",
      recommendation: "הקפד/י על שינה מספקת ושתה/י קפה רק בשעות הבוקר."
    },
    stress_drinker: {
      insight: "הקפה עוזר לך להתמודד עם לחץ – נסי לנשום עמוק או לצאת להליכה.",
      recommendation: "שקול/י לתרגל טכניקות הרפיה במקום שתייה."
    },
    habitual: {
      insight: "הקפה אצלך הוא הרגל – אולי את/ה לא באמת צריך/ה אותו כל פעם.",
      recommendation: "החלף/י לפחות אחת מהכוסות במים או תה ללא קפאין."
    },
    balanced: {
      insight: "צריכת הקפה שלך מאוזנת – כל הכבוד!",
      recommendation: "המשיכ/י להקשיב לגוף ולשמור על הרגלים בריאים."
    },
    unknown: {
      insight: "לא זוהה דפוס ברור.",
      recommendation: "המשיכ/י לעקוב אחר ההרגלים כדי להבין מה משפיע עליך."
    }
  };
  const patternTranslations = {
    morning_drinker: "שותה קפה בבוקר",
    fatigue_based: "שותה בגלל עייפות",
    stress_drinker: "שותה בגלל לחץ",
    habitual: "שתייה מתוך הרגל",
    balanced: "צריכה מאוזנת",
    unknown: "לא זוהה דפוס"
  };
  
  function evaluateDecisionTree(tree, user) {
    if (tree.leaf) return tree.leaf;
  
    if (tree.question(user)) {
      return evaluateDecisionTree(tree.yes, user);
    } else {
      return evaluateDecisionTree(tree.no, user);
    }
  }

function runInitialAnalysis(user) {
  console.log("🧪 בדיקת נתוני משתמש:", {
    avg: user.averageCaffeinePerDay,
    min: user.caffeineRecommendationMin,
    max: user.caffeineRecommendationMax,
    times: user.consumptionTime,
    sleep: user.sleepDurationAverage,
    receivedPattern: user.pattern || "❌ אין דפוס מוכן"
  });

  const pattern = user.pattern || evaluateDecisionTree(decisionTree, user);

  const { insight, recommendation } =
    insightsAndRecommendations[pattern] || insightsAndRecommendations["unknown"];

  const translatedPattern = patternTranslations[pattern] || "לא זוהה דפוס";

  return {
    pattern,
    translatedPattern,
    insight,
    recommendation
  };
}


  module.exports = { runInitialAnalysis };
