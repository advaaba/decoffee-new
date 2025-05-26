import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Pressable,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import BASE_URL from "../../utils/apiConfig";

export default function HistoryDailyData() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedIndexes, setExpandedIndexes] = useState([]);

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

  useEffect(() => {
    const fetchHistory = async () => {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) return;

      try {
        const res = await axios.get(
          `${BASE_URL}/api/dailypattern/history/${userId}`
        );
        const { insights, recommendations } = res.data;

        const groupedByDate = {};

        insights.forEach((insight) => {
          const dateKey = insight.date
            ? new Date(insight.date).toLocaleDateString("he-IL", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })
            : "ללא תאריך";

          if (!groupedByDate[dateKey]) {
            groupedByDate[dateKey] = { insights: [], recommendations: [] };
          }

          if (insight.text) {
            groupedByDate[dateKey].insights.push(insight.text);
          }
        });

        recommendations.forEach((recommendation) => {
          const dateKey = recommendation.date
            ? new Date(recommendation.date).toLocaleDateString("he-IL", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })
            : "ללא תאריך";

          if (!groupedByDate[dateKey]) {
            groupedByDate[dateKey] = { insights: [], recommendations: [] };
          }

          if (recommendation.text) {
            groupedByDate[dateKey].recommendations.push(recommendation.text);
          }
        });

        const combined = Object.entries(groupedByDate).map(([date, data]) => ({
          date,
          insights: data.insights,
          recommendations: data.recommendations,
        }));

        combined.sort((a, b) => new Date(b.date) - new Date(a.date));

        setHistory(combined);
      } catch (err) {
        console.error("❌ שגיאה בשליפת היסטוריה יומית:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const toggleExpand = (id) => {
    setExpandedIndexes((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#888" />
        <Text>טוען היסטוריה...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}> היסטוריית סקירות יומיות</Text>

      {history.length === 0 ? (
        <Text style={styles.empty}>אין עדיין תובנות והמלצות יומיות</Text>
      ) : (
        <>
          <Text style={styles.instructions}>
            ניתן ללחוץ על תובנה או המלצה כדי לקרוא את כולה
          </Text>

          {history.map((entry, idx) => (
            <View
              key={idx}
              style={[
                styles.card,
                { backgroundColor: idx % 2 === 0 ? "#f2f2f2" : "#f2f2f2" },
              ]}
            >
              <Text style={styles.date}> {entry.date}</Text>

              <Text style={styles.subtitle}> תובנות</Text>
              {entry.insights.map((text, i) => {
                const id = `${idx}-insight-${i}`;
                const isExpanded = expandedIndexes.includes(id);
                const displayText =
                  isExpanded || text.length <= 30
                    ? text
                    : text.substring(0, 30) + "...";

                return (
                  <Pressable key={id} onPress={() => toggleExpand(id)}>
                    <Text style={styles.insight}>- {displayText}</Text>
                  </Pressable>
                );
              })}

              <Text style={styles.subtitle}> המלצות</Text>
              {entry.recommendations.map((text, i) => {
                const id = `${idx}-rec-${i}`;
                const isExpanded = expandedIndexes.includes(id);
                const displayText =
                  isExpanded || text.length <= 30
                    ? text
                    : text.substring(0, 30) + "...";
                const isPatternChange = text.includes("שינוי בדפוס היומי:");
                return (
                  <Pressable key={id} onPress={() => toggleExpand(id)}>
                    <Text style={styles.recommendation}>- {displayText}</Text>
                  </Pressable>
                );
              })}

              <View style={styles.separator} />
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: "#0d47a1",
  },
  instructions: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 15,
    color: "#444",
  },
  card: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  date: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    textAlign: "right",
    color: "#1b1b1b",
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
    marginTop: 10,
    textAlign: "right",
    color: "#0d47a1",
  },
  insight: {
    fontSize: 16,
    marginBottom: 6,
    color: "#1a237e",
    textAlign: "right",
  },
  recommendation: {
    fontSize: 16,
    color: "#1a6f2e",
    marginBottom: 6,
    textAlign: "right",
  },
  separator: {
    marginTop: 10,
    borderBottomColor: "#ccc",
    borderBottomWidth: 1,
  },
  empty: {
    textAlign: "center",
    fontSize: 16,
    marginTop: 30,
    color: "#666",
  },
});
