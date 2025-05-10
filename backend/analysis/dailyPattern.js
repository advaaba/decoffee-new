const dailyDecisionTree = {
  question: "drankCoffee",
  branches: {
    true: {
      question: "coffeeDetails.reason",
      branches: {
        עייפות: {
          question: "user.pregnant",
          branches: {
            yes: {
              pattern: "pregnant_fatigue_conflict",
              insight: "שתית קפה כי את עייפה, אך בהריון – צריכת קפאין גבוהה אינה מומלצת.",
              recommendation: "שקלי חלופות בטוחות יותר כמים מים קרים, מנוחה קלה או תה ללא קפאין.",
            },
            no: {
              question: "user.customHealthDescription",
              branches: {
                מיגרנות: {
                  pattern: "migraine_fatigue_response",
                  insight: "שתית קפה כתגובה לעייפות, אבל לפי הדיווח על מיגרנות – קפאין עשוי להשפיע עלייך.",
                  recommendation: "עקבי אחרי התחושות – ייתכן שכדאי להגביל את הצריכה או לשלב חלופות.",
                },
                לב: {
                  pattern: "cardiac_fatigue_response",
                  insight: "שתית קפה מתוך עייפות, אך יש לך מצב לבבי – קפאין עלול להזיק.",
                  recommendation: "מומלץ להיועץ עם רופא לגבי גבולות צריכת קפאין במצבך.",
                },
                default: {
                  question: "user.activityLevel",
                  branches: {
                    Low: {
                      pattern: "low_activity_fatigue_response",
                      insight: "שתית קפה מעייפות, אבל רמת הפעילות שלך נמוכה – ייתכן זה תורם לתחושת העייפות.",
                      recommendation: "שקול/י להגביר פעילות יומית מתונה – זה עשוי להפחית את התלות בקפאין.",
                    },
                    High: {
                      pattern: "high_activity_fatigue_response",
                      insight: "העייפות עשויה לנבוע מרמת פעילות גבוהה – טבעי שתרגיש/י צורך בקפאין.",
                      recommendation: "נסי לתזמן את צריכת הקפאין לזמנים מאוזנים ביום.",
                    },
                    default: {
                      pattern: "fatigue_response",
                      insight: "שתית קפה כדי להתמודד עם עייפות.",
                      recommendation: "שקול/י לבדוק את שעות השינה והמאזן הכללי של יום העבודה.",
                    },
                  },
                },
              },
            },
          },
        },

        הרגל: {
          question: "coffeeDetails.consumptionTime[0]",
          branches: {
            Morning: {
              pattern: "morning_routine",
              insight: "הקפה הוא חלק מהשגרה שלך בבוקר.",
              recommendation: "שקול/י לגוון את שגרת הבוקר מדי פעם – תה, הליכה או מדיטציה.",
            },
            default: {
              pattern: "habitual_drinker",
              insight: "שתית קפה מתוך הרגל.",
              recommendation: "נסה/י לזהות מתי באמת יש צורך בקפה ומתי זה רק דפוס.",
            },
          },
        },

        default: {
          pattern: "general_consumption",
          insight: "שתית קפה מסיבה אחרת.",
          recommendation: "שקול/י לבדוק האם הסיבה מוצדקת או נובעת מתגובה רגשית.",
        },
      },
    },

    false: {
      question: "noCoffeeDetails.consciousDecision",
      branches: {
        yes: {
          question: "generalData.effects",
          branches: {
            physically: {
              pattern: "avoidance_due_to_physical_effects",
              insight: "בחרת להימנע מקפה בגלל השפעה פיזית שזיהית בעבר.",
              recommendation: "המשיכ/י לעקוב אחרי התחושות – אולי הקפה לא מתאים לך גופנית.",
            },
            mentally: {
              pattern: "avoidance_due_to_mental_effects",
              insight: "נראה שהשפעות מנטליות גרמו לך להימנע מקפה.",
              recommendation: "בדוק/י כיצד זה משפיע על מצב הרוח והריכוז לאורך זמן.",
            },
            default: {
              pattern: "conscious_no_coffee",
              insight: "בחרת במודע לא לשתות קפה היום.",
              recommendation: "זה מעיד על מודעות גבוהה – המשיכ/י כך ובדוק/י את התחושות.",
            },
          },
        },
        no: {
          question: "noCoffeeDetails.consideredDrinking",
          branches: {
            yes: {
              pattern: "considered_but_avoided",
              insight: "שקלת לשתות קפה אבל ויתרת.",
              recommendation: "זה שלב חשוב בהתפתחות הרגל חדש – מעולה!",
            },
            default: {
              pattern: "no_coffee_unintentional",
              insight: "לא שתית קפה – ייתכן בלי מודעות מיוחדת לכך.",
              recommendation: "שקול/י האם היה צורך אמיתי, ואם לא – אולי הגוף מסתדר טוב גם בלי.",
            },
          },
        },
      },
    },
  },
};


function traverseTree(node, data) {
  if (!node.question) return node;

  const value = getValueFromData(data, node.question);
  const branch = node.branches?.[value] || node.branches?.["default"];

  if (!branch)
    return {
      pattern: "unknown",
      insight: "לא זוהה דפוס.",
      recommendation: "נסה/י למלא נתונים מדויקים יותר.",
    };

  return traverseTree(branch, data);
}

function getValueFromData(data, path) {
  const keys = path.split(".");
  let value = data;
  for (let key of keys) {
    if (value === undefined || value === null) return "default";
    if (key.includes("[0]")) {
      const baseKey = key.replace("[0]", "");
      value = value?.[baseKey]?.[0] || "default";
    } else {
      value = value[key];
    }
  }
  return value ?? "default";
}

module.exports = {
  traverseTree,
  dailyDecisionTree,
  getValueFromData,
};


