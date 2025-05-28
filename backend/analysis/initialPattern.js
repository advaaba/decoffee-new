const decisionTree = {
  question: (user) => user.pregnant === "yes" && user.averageCaffeinePerDay > 200,
  yes: {
    leaf: "pregnancy_limit_exceeded"
  },
  no: {
    question: (user) => user.averageCaffeinePerDay > user.weight * 3,
    yes: {
      question: (user) => user.activityLevel === "Sedentary",
      yes: {
        leaf: "compensating_lifestyle"
      },
      no: {
        question: (user) => user.sleepDurationAverage < 6,
        yes: {
          leaf: "fatigue_based"
        },
        no: {
          question: (user) => user.effects === "both" || user.effects === "mentally",
          yes: {
            leaf: "stress_drinker"
          },
          no: {
            leaf: "high_intake"
          }
        }
      }
    },
    no: {
      question: (user) => user.healthCondition !== "Healthy" && user.averageCaffeinePerDay > user.caffeineRecommendationMin,
      yes: {
        leaf: "health_risk"
      },
      no: {
        question: (user) => user.averageCaffeinePerDay < user.caffeineRecommendationMin,
        yes: {
          question: (user) => user.consumptionTime.includes("Morning") && user.selfDescription.includes("להתעורר"),
          yes: {
            leaf: "morning_drinker"
          },
          no: {
            leaf: "balanced"
          }
        },
        no: {
          question: (user) => user.consumptionTime.length >= 2,
          yes: {
            question: (user) => user.isTryingToReduce === "yes",
            yes: {
              leaf: "trying_to_reduce"
            },
            no: {
              leaf: "habitual"
            }
          },
          no: {
            leaf: "balanced"
          }
        }
      }
    }
  }
};

const insightsAndRecommendations = {
  pregnancy_limit_exceeded: {
    insight: "את בהריון וצריכת הקפאין שלך גבוהה מהמומלץ.",
    recommendation: "הקפידי לא לעבור 200 מ\"ג ביום – זה חשוב להתפתחות העובר."
  },
  compensating_lifestyle: {
    insight: "נראה כי הקפה משמש כפיצוי על חוסר פעילות.",
    recommendation: "נסי להוסיף תנועה יומית – אפילו הליכה קצרה – במקום להסתמך על קפאין."
  },
  health_risk: {
    insight: "את/ה עם רקע רפואי שדורש הגבלת קפאין.",
    recommendation: "התייעץ/י עם רופא לגבי כמות הקפאין שמתאימה למצבך הרפואי."
  },
  morning_drinker: {
    insight: "את/ה שותה קפה בעיקר כדי להתעורר בבוקר.",
    recommendation: "נסה/י טקס בוקר אלטרנטיבי – הליכה קצרה, שתיית מים, נשימות עמוקות."
  },
  fatigue_based: {
    insight: "הקפה משמש כפיצוי על חוסר שינה.",
    recommendation: "הקפד/י על שינה איכותית של לפחות 7 שעות ונסה/י לדחות את הקפה לאחר הארוחה."
  },
  stress_drinker: {
    insight: "הקפה נצרך בעיקר במצבי מתח או עומס רגשי.",
    recommendation: "שלב/י הרפיה יומית – נשימות, מדיטציה או פעילות מרגיעה."
  },
  high_intake: {
    insight: "צריכת הקפאין שלך גבוהה מהמומלץ לפי המשקל שלך.",
    recommendation: (user) => `למשקל של ${user.weight} ק\"ג, ההמלצה היא עד ${user.weight * 3} מ\"ג ביום. נסה/י להפחית את הכמות בהדרגה.`
  },
  habitual: {
    insight: "נראה שמדובר בשתייה מתוך שגרה ולא בהכרח צורך ממשי.",
    recommendation: "בחר/י לפחות יום אחד בשבוע להפחתה יזומה או שתיית חלופה."
  },
  trying_to_reduce: {
    insight: "את/ה בתהליך הפחתה בצריכת קפה.",
    recommendation: "הגדר/י יעד יומי חדש והשתמש/י באפליקציה למעקב שוטף."
  },
  balanced: {
    insight: "צריכת הקפה שלך נמצאת בטווח התקין ומתאימה לאורח החיים שלך.",
    recommendation: "המשיכ/י לשים לב להשפעות אישיות ולשמור על מודעות."
  }
};

const patternTranslations = {
    morning_drinker: "שותה קפה בבוקר כדי להתעורר",
    fatigue_based: "שתייה עקב עייפות",
    fatigue_response: "תגובה לעייפות",
    stress_drinker: "שתייה עקב מתח",
    high_intake: "צריכה גבוהה לפי משקל",
    habitual: "שתייה מתוך הרגל",
    habitual_drinker: "שתייה מתוך הרגל",
    considered_but_avoided: "שקל/ה אך נמנע/ה",
    trying_to_reduce: "מנסה להפחית צריכה",
    balanced: "צריכה מאוזנת",
    pregnancy_limit_exceeded: "חריגה בהריון",
    compensating_lifestyle: "פיצוי על חוסר תנועה",
    health_risk: "סיכון בריאותי",
    avoidance_due_to_physical_effects: "הימנעות עקב השפעה פיזית",
    avoidance_due_to_mental_effects: "הימנעות עקב השפעה מנטלית",
    conscious_no_coffee: "החלטה מודעת להימנע מקפה",
    no_coffee_unintentional: "לא שתה – ללא כוונה מיוחדת",
    general_consumption: "שתייה כללית / מסיבה אחרת",
    unknown: "לא זוהה דפוס",
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
  const pattern = user.pattern || evaluateDecisionTree(decisionTree, user);
  const rawRecommendation = insightsAndRecommendations[pattern]?.recommendation;
  const recommendation = typeof rawRecommendation === "function"
    ? rawRecommendation(user)
    : rawRecommendation;
  const insight = insightsAndRecommendations[pattern]?.insight || "";
  const translatedPattern = patternTranslations[pattern] || "לא זוהה דפוס";

  return {
    pattern,
    translatedPattern,
    insight,
    recommendation
  };
}

module.exports = { runInitialAnalysis };
