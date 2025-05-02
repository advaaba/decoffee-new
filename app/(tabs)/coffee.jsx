import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useRouter, useLocalSearchParams  } from "expo-router";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
// import { analyzeInitialPattern } from "../../analysis/initialBehaviorModel";
import GeneralData from "./GeneralData";
import CoffeeDetails from "./CoffeeDetails";
import BASE_URL from "../../utils/apiConfig";

export default function CoffeeScreen() {
  const router = useRouter();
  const [isFilled, setIsFilled] = useState(false);
  const { editMode } = useLocalSearchParams(); 
  const [caffeineMin, setCaffeineMin] = useState(null);
  const [caffeineMax, setCaffeineMax] = useState(null);
  const [finalCaffeine, setCaffeine] = useState(null);
  const [surveyData, setSurveyData] = useState(null);

  useEffect(() => {
    const fetchSurveyData = async () => {
      try {
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) return;

        const response = await axios.get(
          `${BASE_URL}/api/auth/get-user/${userId}`
        );

        const userData = response.data.user;
        const caffeineMin = userData.caffeineRecommendationMin;
        const caffeineMax = userData.caffeineRecommendationMax;
        const finalCaffeine = userData.averageCaffeineRecommendation;
        const coffeeData = userData.coffeeConsumption;
        const averageCaffeinePerDay =
          userData.averageCaffeinePerDay ??
          coffeeData?.averageCaffeinePerDay ??
          0;

        // setAiMessage(aiText);
        setCaffeineMin(caffeineMin);
        setCaffeineMax(caffeineMax);
        setCaffeine(finalCaffeine);

        const hasData =
          coffeeData &&
          Object.values(coffeeData).some((value) =>
            Array.isArray(value) ? value.length > 0 : !!value
          );

        if (hasData) {
          setSurveyData(coffeeData);
          setIsFilled(true);
        }

        // console.log("🔥 AI Response:", aiResponse.data);
      } catch (error) {
        console.error("שגיאה בשליפת נתוני coffeeConsumption:", error);
        // setAiMessage("⚠️ לא הצלחנו לבצע ניתוח כרגע.");
      }
    };

    fetchSurveyData();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>  
      <View style={styles.section}>
        {isFilled && editMode !== "true" ? (
          <GeneralData />
        ) : (
          <CoffeeDetails isEditMode={editMode === "true"} />
        )}
      </View>
    </ScrollView>
  );
  
  
}

const styles = StyleSheet.create({
  container: {
    padding: 0,
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  button: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#9E9E9E",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
  },
  section: {
    marginTop: 20, 
    width: "100%", 
  },
});
