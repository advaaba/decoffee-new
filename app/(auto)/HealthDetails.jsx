import React, { useMemo, useState } from "react";
import {
  View,
  Button,
  StyleSheet,
  Text,
  ScrollView,
  Alert,
  TextInput
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { useLocalSearchParams, useRouter } from "expo-router";
import RadioGroup from "react-native-radio-buttons-group";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BASE_URL from "../../utils/apiConfig";

const HealthDetailsScreen = () => {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [errors, setErrors] = useState({});
  const validateForm = () => {
    const newErrors = {};

    if (
      !healthData.birthDay ||
      !healthData.birthMonth ||
      !healthData.birthYear
    ) {
      newErrors.birthDate = "יש למלא תאריך לידה מלא";
    }
    if (!healthData.weight) newErrors.weight = "יש להזין משקל";
    if (!healthData.height) newErrors.height = "יש להזין גובה";
    if (!healthData.gender) newErrors.gender = "יש לבחור מין";
    if (healthData.gender === "Female" && !selectedId)
      newErrors.pregnant = "יש לציין אם את בהיריון";
    if (!healthData.healthCondition)
      newErrors.healthCondition = "יש לבחור מצב בריאותי";
    if (
      healthData.healthCondition === "otherHealthConditions" &&
      !customHealthDescription.trim()
    )
      newErrors.customHealthDescription = "יש למלא תיאור בריאותי";
    if (!healthData.activityLevel)
      newErrors.activityLevel = "יש לבחור רמת פעילות";
    if (!healthData.dietaryPreferences)
      newErrors.dietaryPreferences = "יש לבחור העדפה תזונתית";
    if (
      healthData.dietaryPreferences === "otherDietaryPreferences" &&
      !customDietaryPreference.trim()
    )
      newErrors.customDietaryPreference = "יש למלא תיאור תזונתי";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const days = Array.from({ length: 31 }, (_, i) => ({
    label: `${i + 1}`,
    value: i + 1,
  }));
  const months = Array.from({ length: 12 }, (_, i) => ({
    label: `${i + 1}`,
    value: i + 1,
  }));
  const years = Array.from({ length: 100 }, (_, i) => {
    const year = new Date().getFullYear() - i;
    return { label: `${year}`, value: year };
  });

  const weights = Array.from({ length: 171 }, (_, i) => ({
    label: `${i + 30} ק"ג`,
    value: i + 30,
  }));
  const heights = Array.from({ length: 121 }, (_, i) => ({
    label: `${i + 100} ס"מ`,
    value: i + 100,
  }));

  const genders = [
    { label: "זכר", value: "Male" },
    { label: "נקבה", value: "Female" },
    { label: "אחר", value: "Other" },
  ];

  const healthConditions = [
    { label: "בריא בדרך כלל", value: "Healthy" },
    { label: "סוכרת", value: "Diabetes" },
    { label: "לחץ דם גבוה", value: "High Blood Pressure" },
    { label: "רגישות ללקטוז", value: "Lactose sensitivity" },
    { label: "אלרגיות", value: "Allergies" },
    { label: "אחר", value: "otherHealthConditions" },
  ];

  const activityLevels = [
    { label: "לא פעיל", value: "Sedentary" },
    { label: "פעילות קלה", value: "Light" },
    { label: "פעילות בינונית", value: "Moderate" },
    { label: "פעילות גבוהה", value: "High" },
  ];

  const dietaryPreferences = [
    { label: "רגיל", value: "Normal" },
    { label: "צמחוני", value: "Vegetarian" },
    { label: "טבעוני", value: "Vegan" },
    { label: "כשר", value: "Kosher" },
    { label: "אחר", value: "otherDietaryPreferences" },
  ];
  const isFormValid = () => {
    const requiredFields = [
      "birthDay",
      "birthMonth",
      "birthYear",
      "weight",
      "height",
      "gender",
      "healthCondition",
      "activityLevel",
      "dietaryPreferences",
    ];

    // אם המגדר הוא נקבה, לבדוק אם נבחרה תשובה על היריון
    if (healthData.gender === "Female" && !selectedId) return false;

    // אם נבחר "אחר" במצב בריאותי – חייב למלא תיאור
    if (
      healthData.healthCondition === "otherHealthConditions" &&
      !customHealthDescription.trim()
    ) {
      return false;
    }

    // אם נבחר "אחר" בהעדפה תזונתית – חייב למלא תיאור
    if (
      healthData.dietaryPreferences === "otherDietaryPreferences" &&
      !customDietaryPreference.trim()
    ) {
      return false;
    }

    return requiredFields.every((field) => healthData[field]);
  };

  const radioButtons = useMemo(
    () => [
      {
        id: "yes",
        label: "כן",
        value: "yes",
      },
      {
        id: "no",
        label: "לא",
        value: "no",
      },
    ],
    []
  );

  const [selectedId, setSelectedId] = useState();
  const [customHealthDescription, setCustomHealthDescription] = useState("");
  const [customDietaryPreference, setCustomDietaryPreference] = useState("");

  const [healthData, setHealthData] = useState({
    birthDay: null,
    birthMonth: null,
    birthYear: null,
    age: null,
    weight: null,
    height: null,
    gender: null,
    healthCondition: null,
    activityLevel: null,
    dietaryPreferences: null,
    registrationDate: new Date().toISOString().split("T")[0],
    ...params,
  });

  // פונקציה לחישוב כמות הקפאין המומלצת לבן אדם
  const calculateCaffeineRange = (weight) => {
    if (!weight) return { min: 0, max: 0, averageCaffeineRecommendation: 0 };
    const min = weight * 3;
    const max = weight * 6;
    const averageCaffeineRecommendation = (min + max) / 2;
  
    return { min, max, averageCaffeineRecommendation };
  };
  

  const calculateAge = (year, month, day) => {
    if (!year || !month || !day) return null;
    const birthDate = new Date(year, month - 1, day);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const handleInputChange = (key, value) => {
    const newHealthData = { ...healthData, [key]: value };
    if (
      newHealthData.birthDay &&
      newHealthData.birthMonth &&
      newHealthData.birthYear
    ) {
      newHealthData.age = calculateAge(
        newHealthData.birthYear,
        newHealthData.birthMonth,
        newHealthData.birthDay
      );
    }
    setHealthData(newHealthData);
  };

  const handleContinue = async () => {
    console.log("help");
    console.log("is form valid?", isFormValid());
    console.log("healthData", healthData);
    console.log("custom fields", {
      customHealthDescription,
      customDietaryPreference,
      selectedId,
    });
    if (!validateForm()) return;
    if (!isFormValid()) {
      const missingFields = [];
      const requiredFields = [
        "birthDay",
        "birthMonth",
        "birthYear",
        "weight",
        "height",
        "gender",
        "healthCondition",
        "activityLevel",
        "dietaryPreferences",
      ];

      requiredFields.forEach((field) => {
        if (!healthData[field]) {
          missingFields.push(field);
        }
      });

      if (healthData.gender === "Female" && !selectedId) {
        missingFields.push("pregnant");
      }

      if (
        healthData.healthCondition === "otherHealthConditions" &&
        !customHealthDescription.trim()
      ) {
        missingFields.push("customHealthDescription");
      }

      if (
        healthData.dietaryPreferences === "otherDietaryPreferences" &&
        !customDietaryPreference.trim()
      ) {
        missingFields.push("customDietaryPreference");
      }

      console.log("🚨 שדות חסרים:", missingFields);
      Alert.alert("שגיאה", "אנא מלאי את כל השדות לפני המשך.");
      return;
    }

    const caffeineRecommendation = calculateCaffeineRange(healthData.weight);
    const birthDateString = `${healthData.birthYear}-${healthData.birthMonth
      .toString()
      .padStart(2, "0")}-${healthData.birthDay.toString().padStart(2, "0")}`;
    const birthDate = new Date(birthDateString);

    const finalData = {
      ...healthData,
      pregnant: healthData.gender === "Female" ? selectedId : null,
      caffeineRecommendationMin: caffeineRecommendation.min,
      caffeineRecommendationMax: caffeineRecommendation.max,
      averageCaffeineRecommendation: caffeineRecommendation.averageCaffeineRecommendation,
      birthDate,
      customHealthDescription:
        healthData.healthCondition === "otherHealthConditions"
          ? customHealthDescription
          : null,
      customDietaryPreference:
        healthData.dietaryPreferences === "otherDietaryPreferences"
          ? customDietaryPreference
          : null,
    };
    console.log("📩 שולחת נתונים לשרת:", finalData);

    try {
       const response = await axios.post(`${BASE_URL}/api/auth/register`,finalData);
      console.log("✅ הרשמה הצליחה:", response.data);
      Alert.alert("הצלחה", "נרשמת בהצלחה!");
      await AsyncStorage.setItem("userId", response.data.user.userId);

      router.push("/home-screen");
    } catch (error) {
      console.error("❌ שגיאה בשליחה:", error.response?.data || error.message);
      Alert.alert("שגיאה", "לא הצלחנו לשמור את הנתונים, נסי שוב.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>פרטים אישיים</Text>
        <View style={styles.dateContainer}>
          <Dropdown
            style={styles.dropdownBirth}
            data={days}
            labelField="label"
            valueField="value"
            placeholder="יום"
            value={healthData.birthDay}
            onChange={(item) => handleInputChange("birthDay", item.value)}
          />
          <Dropdown
            style={styles.dropdownBirth}
            data={months}
            labelField="label"
            valueField="value"
            placeholder="חודש"
            value={healthData.birthMonth}
            onChange={(item) => handleInputChange("birthMonth", item.value)}
          />
          <Dropdown
            style={styles.dropdownBirth}
            data={years}
            labelField="label"
            valueField="value"
            placeholder="שנה"
            value={healthData.birthYear}
            onChange={(item) => handleInputChange("birthYear", item.value)}
          />
        </View>
        {errors.birthDate && (
          <Text style={styles.errorText}>{errors.birthDate}</Text>
        )}
        <Dropdown
          style={styles.dropdown}
          data={weights}
          labelField="label"
          valueField="value"
          placeholder={'משקל (ק"ג)'}
          value={healthData.weight}
          onChange={(item) => handleInputChange("weight", item.value)}
        />
        {errors.height && <Text style={styles.errorText}>{errors.weight}</Text>}
        <Dropdown
          style={styles.dropdown}
          data={heights}
          labelField="label"
          valueField="value"
          placeholder={'גובה (ס"מ)'}
          value={healthData.height}
          onChange={(item) => handleInputChange("height", item.value)}
        />
        {errors.height && <Text style={styles.errorText}>{errors.height}</Text>}
        <Dropdown
          style={styles.dropdown}
          data={genders}
          labelField="label"
          valueField="value"
          placeholder="מין"
          value={healthData.gender}
          onChange={(item) => handleInputChange("gender", item.value)}
        />
        {errors.height && <Text style={styles.errorText}>{errors.gender}</Text>}
        {healthData.gender === "Female" && (
          <View style={styles.pregnancyContainer}>
            <RadioGroup
              radioButtons={radioButtons}
              onPress={setSelectedId}
              selectedId={selectedId}
              layout="row"
            />
            <Text style={styles.pregnancyText}>האם את בהיריון?</Text>
          </View>
        )}
        {errors.pregnant && (
          <Text style={styles.errorText}>{errors.pregnant}</Text>
        )}
        <Dropdown
          style={styles.dropdown}
          data={healthConditions}
          labelField="label"
          valueField="value"
          placeholder="מצב בריאותי"
          value={healthData.healthCondition}
          onChange={(item) => handleInputChange("healthCondition", item.value)}
        />
        {errors.healthCondition && (
          <Text style={styles.errorText}>{errors.healthCondition}</Text>
        )}
        {healthData.healthCondition === "otherHealthConditions" && (
          <TextInput
            placeholder="כתוב/י תיאור משלך"
            value={customHealthDescription}
            onChangeText={setCustomHealthDescription}
            style={[styles.input, { marginTop: 10 }]}
          />
        )}
        {errors.customHealthDescription && (
          <Text style={styles.errorText}>{errors.customHealthDescription}</Text>
        )}
        <Dropdown
          style={styles.dropdown}
          data={activityLevels}
          labelField="label"
          valueField="value"
          placeholder="רמת פעילות"
          value={healthData.activityLevel}
          onChange={(item) => handleInputChange("activityLevel", item.value)}
        />
        {errors.activityLevel && (
          <Text style={styles.errorText}>{errors.activityLevel}</Text>
        )}
        <Dropdown
          style={styles.dropdown}
          data={dietaryPreferences}
          labelField="label"
          valueField="value"
          placeholder="העדפות תזונתיות"
          value={healthData.dietaryPreferences}
          onChange={(item) =>
            handleInputChange("dietaryPreferences", item.value)
          }
        />
        {errors.dietaryPreferences && (
          <Text style={styles.errorText}>{errors.dietaryPreferences}</Text>
        )}
        {healthData.dietaryPreferences === "otherDietaryPreferences" && (
          <TextInput
            placeholder="כתוב/י תיאור משלך"
            value={customDietaryPreference}
            onChangeText={setCustomDietaryPreference}
            style={[styles.input, { marginTop: 10 }]}
          />
        )}
        {errors.customDietaryPreference && (
          <Text style={styles.errorText}>{errors.customDietaryPreference}</Text>
        )}
        <Button
          title="המשך"
          onPress={handleContinue}
          color="#4CAF50"
          
          // disabled={!isFormValid()}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1, paddingBottom: 20 ,   backgroundColor: "#fff",},
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  dropdownBirth: {
    width: "30%",
    marginBottom: 15,
    borderBottomWidth: 1,
    paddingHorizontal: 5,
    height: 50,
    borderColor: "gray",
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    textAlign: "right",
  },
  dateContainer: { flexDirection: "row", justifyContent: "space-between" },
  dropdown: {
    height: 50,
    borderColor: "gray",
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginBottom: 15,
    textAlign: "right",
  },
  pregnancyContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },

  pregnancyText: {
    fontSize: 16,
    fontWeight: "500",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginBottom: 10,
    marginTop: -10,
    textAlign: "right",
  },
  input: {
    height: 45,
    borderColor: "gray",
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 10,
    width: "100%",
    marginBottom: 15,
    textAlign: "right",
    fontSize: 16,
    color: "gray",
  },
  button: {
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    alignItems: "center",
  },
});

export default HealthDetailsScreen;
