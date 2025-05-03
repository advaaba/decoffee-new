import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  I18nManager,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BASE_URL from "../../utils/apiConfig";
import { useRouter, useFocusEffect } from "expo-router";
// הפוך את הכיווניות אם צריך (רק אם עדיין לא מוגדר מראש)
I18nManager.forceRTL?.();

export default function GeneralData() {
  const [surveyData, setSurveyData] = useState(null);
  const router = useRouter();

  const effectsMap = {
    physically: "פיזית",
    mentally: "רגשית",
    both: "פיזית ורגשית",
    none: "ללא השפעה",
  };

  const timeMap = {
    Morning: "בוקר",
    Afternoon: "צהריים",
    evening: "ערב",
    night: "לילה",
  };

  const dayMap = {
    Sunday: "ראשון",
    Monday: "שני",
    Tuesday: "שלישי",
    Wednesday: "רביעי",
    Thursday: "חמישי",
    Friday: "שישי",
    Saturday: "שבת",
  };

  const importanceMap = {
    1: "במידה מועטה מאוד",
    2: "במידה מועטה",
    3: "במידה בינונית",
    4: "במידה רבה",
    5: "במידה רבה מאוד",
  };

  useFocusEffect(
    React.useCallback(() => {
      const fetchSurveyData = async () => {
        try {
          const userId = await AsyncStorage.getItem("userId");
          if (!userId) return;
  
          const response = await axios.get(
            `${BASE_URL}/api/generalData/get-survey/${userId}`
          );
          const coffeeData = response.data.survey;
  
          if (coffeeData) {
            setSurveyData(coffeeData);
          }
        } catch (error) {
          console.error("שגיאה בשליפת נתוני הסקירה:", error);
        }
      };
  
      fetchSurveyData();
    }, [])
  );

  if (!surveyData) {
    return (
      <View style={styles.container2}>
        <Text style={styles.loadingText}>⏳ טוען נתונים...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>📋 סקירה כללית - נתוני קפה</Text>

      <View style={styles.card}>
        <Text style={styles.label}> ממוצע כוסות ביום:</Text>
        <Text style={styles.value}>{surveyData.cupsPerDay}</Text>

        <Text style={styles.label}> זמני שתייה:</Text>
        <Text style={styles.value}>
          {surveyData.consumptionTime.map((t) => timeMap[t] || t).join(", ")}
        </Text>

        <Text style={styles.label}> סוגי קפה:</Text>
        {surveyData.coffeeType.map((c, index) => (
          <Text key={index} style={styles.value}>
            ☕ {c.name} - {c.cups} כוסות, {c.size} מ"ל
          </Text>
        ))}

        <Text style={styles.label}> שעות שינה:</Text>
        <Text style={styles.value}>
          מ-{surveyData.sleepFromHour}:00 עד {surveyData.sleepToHour}:00
        </Text>

        <Text style={styles.label}> עובד/ת:</Text>
        <Text style={styles.value}>
          {surveyData.isWorking === "yes" ? "כן" : "לא"}
        </Text>

        {surveyData.isWorking === "yes" && (
          <>
            <Text style={styles.label}> שעות עבודה:</Text>
            <Text style={styles.value}>
              מ-{surveyData.workStartHour}:00 עד {surveyData.workEndHour}:00
            </Text>

            <Text style={styles.label}> ימי עבודה:</Text>
            <Text style={styles.value}>
              {surveyData.workingDays.map((d) => dayMap[d] || d).join(", ")}
            </Text>
          </>
        )}

        <Text style={styles.label}> מנסה להפחית צריכה:</Text>
        <Text style={styles.value}>
          {surveyData.isTryingToReduce === "yes" ? "כן" : "לא"}
        </Text>

        {surveyData.isTryingToReduce === "yes" && (
          <>
            <Text style={styles.label}> צורת ההפחתה:</Text>
            <Text style={styles.value}>{surveyData.reductionExplanation}</Text>
          </>
        )}

        <Text style={styles.label}> חשיבות המעקב:</Text>
        <Text style={styles.value}>
          {importanceMap[surveyData.importanceLevel] || "לא צויין"}
        </Text>

        <Text style={styles.label}> השפעה:</Text>
        <Text style={styles.value}>
          {effectsMap[surveyData.effects] || "לא ידוע"}
        </Text>

        <Text style={styles.label}> תיאור אישי:</Text>
        <Text style={styles.value}>{surveyData.selfDescription}</Text>
        <TouchableOpacity
        style={styles.button}
        onPress={() =>
          router.push({
            pathname: "/CoffeeDetails",
            params: { editMode: "true" },
          })
        }
      >
        <Text style={styles.buttonText}>עריכת הסקירה</Text>
      </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1, paddingBottom: 20 },
  container: {
    padding: 24,
    // backgroundColor: "#f8fafc",
    alignItems: "center",
    minHeight: "100%",
  },
  container2: {
    padding: 10,
    gap: 10,
    direction: "rtl",
    alignItems: "stretch",
  },
  
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    gap: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#444",
    textAlign: "right",
  },
  value: {
    fontSize: 16,
    color: "#222",
    textAlign: "right",
    marginBottom: 25,
  },
  button: {
    backgroundColor: "#4CAF50",
    marginTop: 40,
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 14,
    alignItems: "center",
    alignSelf: "center",
    width: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  loadingText: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 50,
    color: "#777",
  },
});
