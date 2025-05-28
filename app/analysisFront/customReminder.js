const reminderTree = {
  node: "drankCoffee",
  yes: {
    node: "pattern",
    stress_response: {
      reminders: [
        {
          time: "09:00",
          message: "עייף/ה הבוקר? נסה משהו מרענן לפני הקפה – אולי הליכה קצרה או כוס מים ",
        },
        {
          time: "11:00",
          message: "איך רמת האנרגיה שלך עכשיו? אולי הפסקה קלה תעזור לפני עוד קפה ",
        },
      ],
    },
    routine_morning: {
      reminders: [
        {
          time: "08:45",
          message: "האם את/ה באמת רוצה קפה או שזה רק הרגל?  עצור/י רגע לחשוב.",
        },
        {
          time: "10:00",
          message: "נסה לשלב אלמנט חדש בבוקר – מתיחה, נשימה או תה ",
        },
      ],
    },
    evening_drinker: {
      reminders: [
        {
          time: "20:30",
          message: "קפה עכשיו עלול לפגוע בשינה  אולי תעדיפ/י תה מרגיע?",
        },
        {
          time: "22:00",
          message: "שינה איכותית מתחילה מהכנה – בלי קפאין מאוחר ",
        },
      ],
    },
    default: {
      reminders: [],
    },
  },
  no: {
    node: "wantsToReduce",
    yes: {
      reminders: [
        {
          time: "15:00",
          message: "היום לא שתית קפה – זה הזמן לבדוק אם את/ה באמת צריך אותו ",
        },
        {
          time: "17:00",
          message: "אם הצלחת בלי קפה עד עכשיו – כל הכבוד! ",
        },
      ],
    },
    no: {
      reminders: [],
    },
  },
};

function traverseReminderTree(tree, userData) {
  if (!tree.node) return tree.reminders || [];

  const value = userData[tree.node];

  if (typeof value === "boolean") {
    return traverseReminderTree(tree[value ? "yes" : "no"], userData);
  }

  if (typeof value === "string") {
    if (tree[value]) return traverseReminderTree(tree[value], userData);
    if (tree.default) return traverseReminderTree(tree.default, userData);
  }

  return [];
}

function generateCustomReminders(userData) {
  const reminders = traverseReminderTree(reminderTree, userData);

  if (userData.consumptionTime?.includes("Afternoon")) {
    reminders.push({
      time: "14:45",
      message: "זמן קפה של צהריים מתקרב – רוצה לנסות חלופה היום? ",
    });
  }

  if (userData.consumptionTime?.includes("Night")) {
    reminders.push({
      time: "21:30",
      message: "זה הזמן להירגע – אולי להחליף קפה בחליטה מרגיעה? ",
    });
  }

  if (userData.mood === "stressed") {
    reminders.push({
      time: "12:00",
      message: "לחץ? נסה/י לקחת רגע לנשום עמוק או לצאת להליכה קצרה ",
    });
  }

  if (userData.mood === "sad") {
    reminders.push({
      time: "13:00",
      message: "מרגיש/ה ירוד/ה? אולי שיחה עם חבר או רגע מנוחה יעזרו ",
    });
  }

  if (userData.tirednessLevel === "high") {
    reminders.push({
      time: "10:30",
      message: "נשמע שאת/ה עייפ/ה – נסה/י הפסקה של 5 דק' בלי מסך ",
    });
  }

  return reminders;
}

module.exports = { generateCustomReminders };
