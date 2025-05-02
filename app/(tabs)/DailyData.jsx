import React from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import { useRouter } from "expo-router";

export default function DailyData({ dailyData }) {
  const router = useRouter();

  if (!dailyData) return <Text>לא קיימת סקירה להצגה.</Text>;

  const handleEdit = () => {
    console.log("🔄");
    router.push({
      pathname: "/(tabs)/create",
      params: {
        entryId: dailyData._id,
        mood: dailyData.mood,
        focusLevel: dailyData.focusLevel,
        tirednessLevel: dailyData.tirednessLevel,
        drankCoffee: dailyData.drankCoffee.toString(), // תמיד מחרוזת!
        ...(dailyData.drankCoffee
          ? { coffeeDetails: JSON.stringify(dailyData.coffeeDetails) }
          : { noCoffeeDetails: JSON.stringify(dailyData.noCoffeeDetails) }),
      },
    });
    
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📋 סקירה יומית</Text>

      <Item label=" שעות שינה" value={dailyData.sleepHours} />
      <Item label=" מצב רוח" value={translateRating(dailyData.mood)} />
      <Item
        label=" רמת ריכוז"
        value={translateRating(dailyData.focusLevel)}
      />
      <Item
        label=" רמת עייפות"
        value={translateRating(dailyData.tirednessLevel)}
      />
      <Item label=" שתה קפה" value={dailyData.drankCoffee ? "כן" : "לא"} />

      {dailyData.drankCoffee && dailyData.coffeeDetails ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}> פרטי שתיית קפה:</Text>
          <Item label="מספר כוסות" value={dailyData.coffeeDetails.cups} />
          <Item
            label="סוגי קפה"
            value={(dailyData.coffeeDetails.coffeeType || []).join(", ")}
          />
          <Item
            label="זמני שתייה"
            value={(dailyData.coffeeDetails.consumptionTime || []).join(", ")}
          />
          <Item label="סיבה" value={dailyData.coffeeDetails.reason} />
          <Item
            label="השפעה מורגשת"
            value={dailyData.coffeeDetails.feltEffect}
          />
          <Item
            label="צורך מיוחד"
            value={dailyData.coffeeDetails.specialNeed}
          />
          {dailyData.coffeeDetails.specialNeed === "yes" && (
            <Item
              label="סיבת הצורך"
              value={dailyData.coffeeDetails.specialNeedReason}
            />
          )}
          <Item
            label="שקל להפחית"
            value={dailyData.coffeeDetails.consideredReducing}
          />
          <Item
            label="רוצה להפחית מחר"
            value={dailyData.coffeeDetails.wantToReduceTomorrow}
          />
        </View>
      ) : dailyData.noCoffeeDetails ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔵 לא שתה קפה:</Text>
          <Item
            label="איך הרגיש ללא קפה"
            value={dailyData.noCoffeeDetails.feltWithoutCoffee}
          />
          <Item
            label="שקל לשתות"
            value={dailyData.noCoffeeDetails.consideredDrinking}
          />
          <Item
            label="סיבת שיקול"
            value={dailyData.noCoffeeDetails.consideredDrinkingReason}
          />
          <Item
            label="האם ישתה בהמשך היום"
            value={dailyData.noCoffeeDetails.willDrinkLater}
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
            value={dailyData.noCoffeeDetails.consciousDecision}
          />
          <Item
            label="ישתה מחר"
            value={dailyData.noCoffeeDetails.willDrinkTomorrow}
          />
          <Item
            label="רוצה להמשיך בלי קפה"
            value={dailyData.noCoffeeDetails.wantToContinueNoCoffee}
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

function translateRating(value) {
  switch (value) {
    case "great":
      return "מצוין";
    case "good":
      return "טוב";
    case "okay":
      return "בסדר";
    case "bad":
      return "רע";
    case "terrible":
      return "נורא";
    default:
      return value;
  }
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
