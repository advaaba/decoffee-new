import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { BarChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import BASE_URL from "../../utils/apiConfig";

const screenWidth = Dimensions.get("window").width;
const barSpacing = 150;

const dailyPatternLabels = {
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

export default function PatternChartScreen() {
  const [patternCounts, setPatternCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatterns = async () => {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) return;

      try {
        const res = await axios.get(
          `${BASE_URL}/api/dailypattern/history/${userId}`
        );
        const insights = res.data.insights || [];

        const reverseTranslations = Object.entries(dailyPatternLabels).reduce(
          (acc, [key, val]) => {
            acc[val] = key;
            return acc;
          },
          {}
        );

        const counts = {};

        insights.forEach((insight, index) => {
          if (
            insight.source === "system" &&
            insight.text &&
            insight.text.includes("שינוי בדפוס היומי")
          ) {
            const regex = /מ-["“]?(.+?)["”]? ל-["“]?(.+?)["”]?(\.|$)/;
            const match = insight.text.match(regex);

            if (match) {
              const fromLabel = match[1].trim();
              const toLabel = match[2].trim();
              const normalize = (str) =>
                str
                  .replace(/["”“׳"']/g, "")
                  .trim()
                  .replace(/\s+/g, " ");

              const fromKey = Object.keys(dailyPatternLabels).find(
                (key) =>
                  normalize(dailyPatternLabels[key]).includes(
                    normalize(fromLabel)
                  ) ||
                  normalize(fromLabel).includes(
                    normalize(dailyPatternLabels[key])
                  )
              );

              const toKey = Object.keys(dailyPatternLabels).find(
                (key) =>
                  normalize(dailyPatternLabels[key]).includes(
                    normalize(toLabel)
                  ) ||
                  normalize(toLabel).includes(
                    normalize(dailyPatternLabels[key])
                  )
              );
              if (!fromKey || !toKey) {
                console.warn("⚠️ דפוס לא זוהה:", { fromLabel, toLabel });
              }

              console.log(`📍 שינוי מס׳ ${index + 1}:`);
              console.log("  מ:", fromLabel, "→", fromKey);
              console.log("  ל:", toLabel, "→", toKey);

              if (fromKey) {
                counts[fromKey] = (counts[fromKey] || 0) + 1;
              }

              if (toKey) {
                counts[toKey] = (counts[toKey] || 0) + 1;
              }
            }
          }
        });

        console.log("📊 patternCounts לפני סטייט:", counts);
        setPatternCounts(counts);
      } catch (err) {
        console.error("שגיאה בטעינת דפוסים:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPatterns();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={{ marginTop: 10 }}>טוען נתונים...</Text>
      </View>
    );
  }

  const sortedPatterns = Object.entries(patternCounts).sort(
    (a, b) => b[1] - a[1]
  );

  if (sortedPatterns.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={{ fontSize: 18 }}>
          אין עדיין מספיק נתונים להצגת דפוסים
        </Text>
      </View>
    );
  }

  const chartLabels = sortedPatterns.map(
    ([key]) => dailyPatternLabels[key] || key
  );

  const chartData = sortedPatterns.map(([, value]) => value);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}> גרף דפוסי שתייה</Text>
      <Text style={styles.instructions}>
        גרף זה מציג את דפוסי השתייה שלך.{"\n"}
        כדי לראות את כל הדפוסים, גלול ימינה
      </Text>
      <ScrollView horizontal={true} showsHorizontalScrollIndicator={true}>
        <BarChart
          data={{
            labels: chartLabels,
            datasets: [{ data: chartData }],
          }}
          width={chartLabels.length * barSpacing}
          height={
            chartData.length === 1 ? 250 : 250 + Math.max(...chartData) * 20
          }
          fromZero
          withVerticalLabels={true}
          // showValuesOnTopOfBars
          withHorizontalLabels={true}
          segments={Math.max(...chartData) < 4 ? 4 : Math.max(...chartData)}
          chartConfig={{
            backgroundGradientFrom: "#f4f4f4",
            backgroundGradientTo: "#f4f4f4",
            decimalPlaces: 0,
            color: () => "#007bff",
            labelColor: () => "#333",
            formatYLabel: (val) => {
              const rounded = Math.round(val);
              return rounded >= 1 && rounded <= 5 ? `${rounded}` : "";
            },
          }}
          style={{
            borderRadius: 16,
            marginRight: 10,
          }}
          verticalLabelRotation={0}
        />
      </ScrollView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
    paddingBottom: 40,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#184e77",
    textAlign: "center",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  instructions: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 15,
    color: "#444",
  },
});
