import { useEffect, useState, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter, useLocalSearchParams } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import DailyData from "./DailyData";
import DailyQuestions from "./DailyQuestions";
import BASE_URL from "../../utils/apiConfig";

export default function Create() {
  const [dailyData, setDailyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const params = useLocalSearchParams();
  const [isEditMode, setIsEditMode] = useState(false);

  const initialParamsRef = useRef(params);
  const router = useRouter();

  useEffect(() => {
    if (params.entryId) {
      setIsEditMode(true);
      setLoading(false);
    } else if (params.reload === "true" || !dailyData) {
      fetchDailyData();
    }
  }, [params]);
  
  
  useEffect(() => {
    if (!params.entryId && isEditMode) {
      console.log("🔄 יציאה ממצב עריכה");
      setIsEditMode(false);
      setDailyData(null);
    }
  }, [params]);
  
  const fetchDailyData = async () => {
    const userId = await AsyncStorage.getItem("userId");
    if (!userId) return;

    try {
      const today = new Date().toISOString().split("T")[0];
      const res = await axios.get(
        `${BASE_URL}/api/dailyData/by-date/${userId}?date=${today}`
      );
      setDailyData(res.data || null);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setDailyData(null);
      } else {
        console.error("❌ שגיאה בשליפת סקירה יומית:", err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;
  return (
    <View style={{ flex: 1 }}>
      {isEditMode ? (
       <DailyQuestions isEditMode={true} editParams={params} /> //מצב עריכה
      ) : dailyData ? (
        <DailyData dailyData={dailyData} /> // מצב הצגת נתונים יומיים
      ) : (
        <DailyQuestions isEditMode={false} /> // יצירת סקירה חדשה
      )}
    </View>
  );
}
