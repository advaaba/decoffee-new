import React from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import { useRouter } from "expo-router";

export default function DailyData({ dailyData }) {
  const router = useRouter();

  if (!dailyData) return <Text>לא קיימת סקירה להצגה.</Text>;

  const handleEdit = () => {
    router.push({
      pathname: "/(tabs)/create",
      params: {
        entryId: dailyData._id,
        mood: dailyData.mood,
        focusLevel: dailyData.focusLevel,
        tirednessLevel: dailyData.tirednessLevel,
        drankCoffee: dailyData.drankCoffee.toString(),
        ...(dailyData.drankCoffee
          ? { coffeeDetails: JSON.stringify(dailyData.coffeeDetails) }
          : { noCoffeeDetails: JSON.stringify(dailyData.noCoffeeDetails) }),
      },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}> סקירה יומית</Text>

      <Item label="שעות שינה" value={dailyData.sleepHours} />
      <Item label="מצב רוח" value={translateArrayOrSingle(dailyData.mood)} />
      <Item
        label="רמת ריכוז"
        value={translateArrayOrSingle(dailyData.focusLevel)}
      />
      <Item
        label="רמת עייפות"
        value={translateArrayOrSingle(dailyData.tirednessLevel)}
      />
      <Item label="שתה קפה" value={dailyData.drankCoffee ? "כן" : "לא"} />

      {dailyData.drankCoffee && dailyData.coffeeDetails ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔵 פרטי שתיית קפה:</Text>
          <Item label="מספר כוסות" value={dailyData.coffeeDetails.cups} />
          <Item
            label="סוגי קפה"
            value={(dailyData.coffeeDetails.coffeeType || []).join(", ")}
          />
          <Item
            label="זמני שתייה"
            value={translateTimeOfDay(
              dailyData.coffeeDetails.consumptionTime || []
            )}
          />

          <Item label="סיבה" value={dailyData.coffeeDetails.reason} />
          <Item
            label="השפעה מורגשת"
            value={translateYesNo(dailyData.coffeeDetails.feltEffect)}
          />
          <Item
            label="צורך מיוחד"
            value={translateYesNo(dailyData.coffeeDetails.specialNeed)}
          />
          {dailyData.coffeeDetails.specialNeed === "yes" && (
            <Item
              label="סיבת הצורך"
              value={dailyData.coffeeDetails.specialNeedReason}
            />
          )}
          <Item
            label="שקל להפחית"
            value={translateYesNo(dailyData.coffeeDetails.consideredReducing)}
          />
          <Item
            label="רוצה להפחית מחר"
            value={translateYesNo(dailyData.coffeeDetails.wantToReduceTomorrow)}
          />
        </View>
      ) : dailyData.noCoffeeDetails ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🟢 לא שתה קפה:</Text>
          <Item
            label="איך הרגיש ללא קפה"
            value={dailyData.noCoffeeDetails.feltWithoutCoffee}
          />
          <Item
            label="שקל לשתות"
            value={translateYesNo(dailyData.noCoffeeDetails.consideredDrinking)}
          />
          <Item
            label="סיבת שיקול"
            value={dailyData.noCoffeeDetails.consideredDrinkingReason}
          />
          <Item
            label="האם ישתה בהמשך היום"
            value={translateYesNoMaybe(
              dailyData.noCoffeeDetails.willDrinkLater
            )}
          />
          <Item
            label="סיבה לכך"
            value={dailyData.noCoffeeDetails.willDrinkLaterReason}
          />
          <Item
            label="סיבת אי שתייה"
            value={dailyData.noCoffeeDetails.reasonNotDrinking}
          />
          <Item
            label="בחירה מודעת"
            value={translateYesNo(dailyData.noCoffeeDetails.consciousDecision)}
          />
          <Item
            label="ישתה מחר"
            value={translateYesNoMaybe(
              dailyData.noCoffeeDetails.willDrinkTomorrow
            )}
          />
          <Item
            label="רוצה להמשיך בלי קפה"
            value={translateYesNo(
              dailyData.noCoffeeDetails.wantToContinueNoCoffee
            )}
          />
        </View>
      ) : null}

      <Button title="עריכת סקירה" onPress={handleEdit} color="#4CAF50" />
    </View>
  );
}

function Item({ label, value }) {
  return (
    <Text style={styles.item}>
      <Text style={styles.label}>{label}: </Text>
      {value || "—"}
    </Text>
  );
}

function translateArrayOrSingle(value) {
  const map = {
    great: "מצוין",
    good: "טוב",
    okay: "בסדר",
    bad: "רע",
    terrible: "נורא",
    focused: "מרוכז",
    distracted: "מוסח",
    tired: "עייף",
    fresh: "רענן",
    stressed: "לחוץ",
    low: "ירוד",
  };

  if (Array.isArray(value)) {
    return value.map((v) => map[v] || v).join(", ");
  }
  return map[value] || value;
}

function translateYesNo(value) {
  const map = {
    yes: "כן",
    no: "לא",
  };
  return map[value] || value;
}

function translateYesNoMaybe(value) {
  const map = {
    yes: "כן",
    no: "לא",
    "don't know": "לא בטוח",
  };
  return map[value] || value;
}

function translateTimeOfDay(time) {
  const map = {
    Morning: "בוקר",
    Afternoon: "צהריים",
    evening: "ערב",
    night: "לילה",
  };

  if (Array.isArray(time)) {
    return time.map((t) => map[t] || t).join(", ");
  }

  return map[time] || time;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    margin: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "center",
  },
  item: {
    fontSize: 16,
    marginBottom: 6,
    textAlign: "right",
    writingDirection: "rtl",
  },
  label: {
    fontWeight: "500",
  },
  section: {
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "right",
  },
});
