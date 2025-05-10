import React, { useEffect, useMemo, useState } from "react";
import {
  Text,
  View,
  ScrollView,
  StyleSheet,
  Button,
  Alert,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Dropdown, MultiSelect } from "react-native-element-dropdown";
import { useRouter } from "expo-router";
import RadioGroup from "react-native-radio-buttons-group";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BASE_URL from "../../utils/apiConfig";
import { useLocalSearchParams } from "expo-router";

export default function CoffeeDetails() {
  const router = useRouter();
  const { editMode } = useLocalSearchParams();
  const isEditMode = editMode === "true";

  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const [selfDescription, setSelfDescription] = useState("");
  const [isWorking, setIsWorking] = useState(null);
  const [effects, setEffects] = useState(null);
  const [isTryingToReduce, setIsTryingToReduce] = useState(null);
  const [reductionExplanation, setReductionExplanation] = useState("");
  const [sleepFromHour, setSleepFromHour] = useState(null);
  const [sleepToHour, setSleepToHour] = useState(null);
  const [workStartHour, setWorkStartHour] = useState(null);
  const [workEndHour, setWorkEndHour] = useState(null);
  const [importanceLevel, setImportanceLevel] = useState(null);
  const [isMotivation, setIsMotivation] = useState(false);
  const [coffeeTypesFromDb, setCoffeeTypesFromDb] = useState([]);
  const [errors, setErrors] = useState({});
  const [servingSizesByType, setServingSizesByType] = useState({});
  const [customDescription, setCustomDescription] = useState("");
  const [cupsByType, setCupsByType] = useState({});
  const [workingDays, setWorkingDays] = useState([]);
  const [userFromStorage, setUserFromStorage] = useState(null);

  const [coffeeData, setCoffeeData] = useState({
    coffeeType: [],
    consumptionTime: [],
    cupsPerDay: null,
  });

  useEffect(() => {
    const fetchCoffeeTypes = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/drinks`);
        setCoffeeTypesFromDb(response.data); // שומרת את כל המידע
      } catch (error) {
        console.error("❌ שגיאה בשליפת סוגי הקפה:", error.message);
      }
    };

    fetchCoffeeTypes();
  }, []);
  useEffect(() => {
    const fetchExistingSurvey = async () => {
      if (!isEditMode) return;

      try {
        const userId = await AsyncStorage.getItem("userId");

        const userDataRaw = await AsyncStorage.getItem("userData");
        const parsedUser = JSON.parse(userDataRaw);
        setUserFromStorage(parsedUser);

        const response = await axios.get(
          `${BASE_URL}/api/generalData/get-survey/${userId}`
        );
        const data = response.data.survey;

        if (!data) return;

        setCoffeeData({
          coffeeType: data.coffeeType.map((c) => c.name),
          consumptionTime: data.consumptionTime || [],
        });

        const newServingSizes = {};
        const newCups = {};
        data.coffeeType.forEach((c) => {
          newServingSizes[c.name] = c.size;
          newCups[c.name] = c.cups;
        });

        setServingSizesByType(newServingSizes);
        setCupsByType(newCups);
        setSelfDescription(data.selfDescription || "");
        setIsWorking(data.isWorking);
        setEffects(data.effects);
        setIsTryingToReduce(data.isTryingToReduce);
        setReductionExplanation(data.reductionExplanation || "");
        setSleepFromHour(data.sleepFromHour);
        setSleepToHour(data.sleepToHour);
        setWorkStartHour(data.workStartHour);
        setWorkEndHour(data.workEndHour);
        setImportanceLevel(data.importanceLevel);
        setIsMotivation(data.isMotivation || false);
        setWorkingDays(data.workingDays || []);
        setCustomDescription(
          data.selfDescription === "other" ? data.customDescription : ""
        );
      } catch (err) {
        console.error("❌ שגיאה בטעינת הסקירה לעריכה:", err);
      }
    };

    fetchExistingSurvey();
  }, [isEditMode]);

  const coffeeOptions = coffeeTypesFromDb.map((drink) => ({
    label: drink.name,
    value: drink.value,
  }));

  //בדיקת מילוי השדות
  const checkValidate = () => {
    const newErrors = {};
    const { coffeeType, cupsPerDay, consumptionTime } = coffeeData;

    if (sleepFromHour === null)
      newErrors.sleepFromHour = "יש לבחור שעת התחלת שינה";
    if (sleepToHour === null) newErrors.sleepToHour = "יש לבחור שעת סיום שינה";
    if (!isWorking) newErrors.isWorking = "יש לציין אם אתה עובד או לא";
    if (
      isWorking === "yes" &&
      (workStartHour === null || workEndHour === null)
    ) {
      if (workStartHour === null)
        newErrors.workStartHour = "יש לבחור שעת התחלת עבודה";
      if (workEndHour === null)
        newErrors.workEndHour = "יש לבחור שעת סיום עבודה";
    }
    if (!coffeeData.consumptionTime || coffeeData.consumptionTime.length === 0)
      newErrors.consumptionTime = "יש לבחור לפחות זמן אחד לצריכת קפה";
    if (
      coffeeData.coffeeType.some((type) => cupsByType[type] === undefined) ||
      coffeeData.coffeeType.some((type) => cupsByType[type] == null)
    ) {
      newErrors.cupsByType = "יש להזין כמות כוסות לכל סוג קפה";
    }
    if (!effects) newErrors.effects = "יש לבחור השפעה";
    if (!isTryingToReduce)
      newErrors.isTryingToReduce = "יש לבחור אם אתה מנסה להפחית";
    if (isTryingToReduce === "yes" && reductionExplanation.trim() === "")
      newErrors.reductionExplanation = "יש לפרט איך אתה מנסה להפחית צריכה";
    if (!importanceLevel) newErrors.importanceLevel = "יש לבחור רמת חשיבות";
    if (!coffeeType || coffeeType.length === 0)
      newErrors.coffeeType = "יש לבחור לפחות סוג קפה אחד";
    if (!selfDescription) newErrors.selfDescription = "יש לבחור תיאור אישי";
    if (coffeeData.coffeeType.some((type) => !servingSizesByType[type])) {
      newErrors.servingSizesByType = "יש לבחור מידת הגשה לכל סוג קפה שנבחר";
    }
    if (selfDescription === "other" && customDescription.trim() === "") {
      newErrors.selfDescription = "יש להזין תיאור אישי";
    }
    if (isWorking === "yes" && workingDays.length === 0) {
      newErrors.workingDays = "יש לבחור לפחות יום עבודה אחד";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length > 0;
  };


  const daysOfWeek = [
    { id: "sun", label: "ראשון", value: "Sunday" },
    { id: "mon", label: "שני", value: "Monday" },
    { id: "tue", label: "שלישי", value: "Tuesday" },
    { id: "wed", label: "רביעי", value: "Wednesday" },
    { id: "thu", label: "חמישי", value: "Thursday" },
    { id: "fri", label: "שישי", value: "Friday" },
    { id: "sat", label: "שבת", value: "Saturday" },
  ];

  const handleInputChange = (key, value) => {
    setCoffeeData((prev) => ({ ...prev, [key]: value }));

    setErrors((prevErrors) => {
      const newErrors = { ...prevErrors };
      delete newErrors[key];
      return newErrors;
    });
  };


  const calculateDuration = (start, end) => {
    if (start == null || end == null) return 0;
    return end >= start ? end - start : 24 - start + end;
  };

  const sleepDurationAverage = useMemo(
    () => calculateDuration(sleepFromHour, sleepToHour),
    [sleepFromHour, sleepToHour]
  );

  const workDurationAverage = useMemo(
    () => calculateDuration(workStartHour, workEndHour),
    [workStartHour, workEndHour]
  );

  const importanceLevels = [
    { label: "במידה מועטה מאוד", value: 1 },
    { label: "במידה מועטה", value: 2 },
    { label: "במידה בינונית", value: 3 },
    { label: "במידה רבה", value: 4 },
    { label: "במידה רבה מאוד", value: 5 },
  ];

  const hoursOptions = Array.from({ length: 24 * 2 }, (_, i) => {
    const hour = Math.floor(i / 2);
    const minutes = (i % 2) * 30;
    return {
      label: `${hour.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}`,
      value: hour + minutes / 60,
    };
  });

  const yesNoOptions = useMemo(
    () => [
      { id: "yes", label: "כן", value: "yes" },
      { id: "no", label: "לא", value: "no" },
    ],
    []
  );

  const effectsOptions = useMemo(
    () => [
      { id: "physically", label: "פיזית", value: "physically" },
      { id: "mentally", label: "רגשית", value: "mentally" },
      { id: "both", label: "שניהם", value: "both" },
      { id: "none", label: "אף אחד מהם", value: "none" },
    ],
    []
  );

  const servingSizes = [
    { label: ' (30 מ"ל)', value: "30" },
    { label: ' (50 מ"ל)', value: "50" },
    { label: ' (100 מ"ל)', value: "100" },
    { label: ' (160 מ"ל)', value: "160" },
    { label: ' (200 מ"ל)', value: "200" },
    { label: ' (240 מ"ל)', value: "240" },
    { label: ' (360 מ"ל)', value: "360" },
    { label: ' (500 מ"ל)', value: "500" },
    { label: ' (660 מ"ל)', value: "660" },
  ];

  const coffeeConsumption = Array.from({ length: 11 }, (_, i) => ({
    label: `כוסות ${i}`,
    value: i,
  }));

  const totalCupsPerDay = coffeeData.coffeeType.reduce(
    (sum, item) => sum + (item.cups || 0),
    0
  );

  const timesPerDay = [
    { label: "בוקר", value: "Morning" },
    { label: "צהריים", value: "Afternoon" },
    { label: "ערב", value: "evening" },
    { label: "לילה", value: "night" },
  ];

  const selfDescriptions = [
    {
      label: "אני טיפוס של בוקר, אוהב קפה  ",
      value: "אני טיפוס של בוקר, אוהב קפה  ",
    },
    {
      label: "שותה קפה בעיקר כדי להתעורר",
      value: "שותה קפה בעיקר כדי להתעורר",
    },
    { label: "קפה בשבילי הוא רגע של שקט", value: "קפה בשבילי הוא רגע של שקט" },
    { label: "שותה קפה מתוך הרגל", value: "שותה קפה מתוך הרגל" },
    { label: "קפה בשבילי הוא חלק מהחברה", value: "קפה בשבילי הוא חלק מהחברה" },
    {
      label: "לא מתחיל/ה את היום בלי קפה",
      value: "לא מתחיל/ה את היום בלי קפה",
    },
    {
      label: "קפה זה החבר הכי טוב שלי בבוקר",
      value: "קפה זה החבר הכי טוב שלי בבוקר",
    },
    {
      label: "אני לא באמת אוהב/ת קפה, פשוט רגיל/ה לשתות",
      value: "אני לא באמת אוהב/ת קפה, פשוט רגיל/ה לשתות",
    },
    {
      label: "אני נהנ/ית מהריח יותר מאשר מהטעם",
      value: "אני נהנ/ית מהריח יותר מאשר מהטעם",
    },
    { label: "הקפה בשבילי הוא תרבות", value: "הקפה בשבילי הוא תרבות" },
    {
      label: "שותה קפה כשעובד/ת, אבל לא מחוץ לזה",
      value: "שותה קפה כשעובד/ת, אבל לא מחוץ לזה",
    },
    { label: "שותה קפה רק כשיש עוגה ליד", value: "שותה קפה רק כשיש עוגה ליד" },
    {
      label: "מנסה להפוך לתה אדם, אבל הקפה לא משחרר",
      value: "מנסה להפוך לתה אדם, אבל הקפה לא משחרר",
    },
    { label: "אחר", value: "other" },
  ];

  //איפוס הפרמטרים בעת היציאה מהדף
  const resetForm = () => {
    setSelfDescription("");
    setIsWorking(null);
    setEffects(null);
    setIsTryingToReduce(null);
    setReductionExplanation("");
    setSleepFromHour(null);
    setSleepToHour(null);
    setWorkStartHour(null);
    setWorkEndHour(null);
    setImportanceLevel(null);
    setIsMotivation(false);
    setCoffeeData({
      coffeeType: [],
      cupsPerDay: null,
      consumptionTime: [],
    });
    setErrors({});
  };

  // מוטיבציה
  const handleImportanceChange = (item) => {
    setImportanceLevel(item.value);
    setIsMotivation(item.value >= 3);
  };

  const handleRegister = async () => {
    const hasErrors = checkValidate();
    if (hasErrors) {
      Alert.alert("שגיאה", "אנא תקנ/י את השדות המסומנים באדום");
      return;
    }

    try {
      const userDataRaw = await AsyncStorage.getItem("userData");
      const parsedUser = JSON.parse(userDataRaw);

      // מערך coffeeType עם מבנה של name + size + cups
      const structuredCoffeeTypes = coffeeData.coffeeType.map((type) => ({
        name: type,
        size: servingSizesByType[type] || null,
        cups: cupsByType[type] || 0,
      }));

      const drinksWithCups = structuredCoffeeTypes.filter(
        (drink) => typeof drink.cups === "number" && drink.cups > 0
      );

      const averageCupsPerDay =
        drinksWithCups.length > 0
          ? drinksWithCups.reduce((sum, drink) => sum + drink.cups, 0) /
            drinksWithCups.length
          : 0;

      const averageCaffeinePerDay = structuredCoffeeTypes.reduce(
        (total, type) => {
          const coffee = coffeeTypesFromDb.find((c) => c.value === type.name);
          const userServingSize = parseFloat(type.size) || 0;
          const cups = type.cups || 0;

          if (coffee && coffee.servingSizeMl && coffee.caffeineMg) {
            const caffeinePerCup =
              (userServingSize / coffee.servingSizeMl) * coffee.caffeineMg;
              return Math.round((total + caffeinePerCup * cups) * 100) / 100;
              ;
          }

          return total;
        },
        0
      );

      const userId = await AsyncStorage.getItem("userId");
      const finalData = {
        coffeeConsumption: {
          coffeeType: structuredCoffeeTypes,
          cupsPerDay: averageCupsPerDay,
          consumptionTime: coffeeData.consumptionTime,
          averageCaffeinePerDay,
          selfDescription:
            selfDescription === "other" ? customDescription : selfDescription,
          isWorking,
          effects,
          isTryingToReduce,
          sleepFromHour,
          sleepToHour,
          workStartHour,
          workEndHour,
          sleepDurationAverage,
          workDurationAverage,
          isMotivation,
          reductionExplanation,
          importanceLevel,
          workingDays,
        },
      };
      //
      await axios.post(
        `${BASE_URL}/api/generalData/update-survey/${userId}`,
        finalData.coffeeConsumption
      );

      await axios.post(`${BASE_URL}/api/pattern/analyze`, {
        userId,
        data: finalData.coffeeConsumption
      });      

      resetForm();
      
      router.push("/coffee");
    } catch (err) {
      console.error("❌ שגיאה בעדכון המשתמש:", err);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>פרטי צריכת קפה כללית</Text>
        <Text style={styles.text}> כמה שעות את/ה ישנ/ה בממוצע ביממה?</Text>
        <View style={styles.sleepTimeRow}>
          <Dropdown
            style={[
              styles.dropdown,
              styles.sleepDropdown,
              errors.selfDescription && styles.errorField,
            ]}
            data={hoursOptions}
            labelField="label"
            valueField="value"
            placeholder="עד שעה"
            value={sleepToHour}
            onChange={(item) => {
              setSleepToHour(item.value);
              setErrors((prev) => {
                const updated = { ...prev };
                delete updated.selfDescription;
                return updated;
              });
            }}
            placeholderStyle={styles.placeholderText}
            selectedTextStyle={styles.selectedText}
          />

          <Dropdown
            style={[
              styles.dropdown,
              styles.sleepDropdown,
              errors.selfDescription && styles.errorField,
            ]}
            data={hoursOptions}
            labelField="label"
            valueField="value"
            placeholder="משעה"
            value={sleepFromHour}
            onChange={(item) => {
              setSleepFromHour(item.value);
              setErrors((prev) => {
                const updated = { ...prev };
                delete updated.selfDescription;
                return updated;
              });
            }}
            placeholderStyle={styles.placeholderText}
            selectedTextStyle={styles.selectedText}
          />
        </View>
        <Text style={styles.text}> האם אתה בשגרת עבודה?</Text>
        <RadioGroup
          radioButtons={yesNoOptions}
          onPress={(val) => {
            setIsWorking(val);
            setErrors((prev) => {
              const updated = { ...prev };
              delete updated.isWorking;
              return updated;
            });
          }}
          selectedId={isWorking}
          layout="row"
        />
        {errors.isWorking && (
          <Text style={{ color: "red" }}>{errors.isWorking}</Text>
        )}
        {isWorking === "yes" && (
          <>
            <Text style={styles.text}> מהן שעות העבודה שלך?</Text>
            <View style={styles.sleepTimeRow}>
              <Dropdown
                style={[
                  styles.dropdown,
                  styles.sleepDropdown,
                  errors.selfDescription && styles.errorField,
                ]}
                data={hoursOptions}
                labelField="label"
                valueField="value"
                placeholder="עד שעה"
                value={workEndHour}
                onChange={(item) => {
                  setWorkEndHour(item.value);
                  setErrors((prev) => {
                    const updated = { ...prev };
                    delete updated.selfDescription;
                    return updated;
                  });
                }}
                placeholderStyle={styles.placeholderText}
                selectedTextStyle={styles.selectedText}
              />
              <Dropdown
                style={[
                  styles.dropdown,
                  styles.sleepDropdown,
                  errors.selfDescription && styles.errorField,
                ]}
                data={hoursOptions}
                labelField="label"
                valueField="value"
                placeholder="משעה"
                value={workStartHour}
                onChange={(item) => {
                  setWorkStartHour(item.value);
                  setErrors((prev) => {
                    const updated = { ...prev };
                    delete updated.selfDescription;
                    return updated;
                  });
                }}
                placeholderStyle={styles.placeholderText}
                selectedTextStyle={styles.selectedText}
              />
            </View>
            <Text style={styles.text}>כמה ימים בשבוע את/ה עובד/ת?</Text>
            <Text style={styles.textOption}>*בחירת אופציה מרובה</Text>
            <MultiSelect
              style={[
                styles.dropdown,
                errors.workingDays && styles.errorField,
                { zIndex: 1000 },
              ]}
              data={daysOfWeek}
              labelField="label"
              valueField="value"
              placeholder="בחר/י ימים"
              value={workingDays}
              onChange={(item) => {
                setWorkingDays(item);
                setErrors((prev) => {
                  const updated = { ...prev };
                  delete updated.workingDays;
                  return updated;
                });
              }}
              placeholderStyle={styles.placeholderText}
              selectedTextStyle={styles.selectedText}
              selectedStyle={{
                flexDirection: "row-reverse",
                justifyContent: "flex-end",
                alignItems: "center",
              }}
              itemTextStyle={{
                textAlign: "right",
                textDirection: "rtl",
              }}
              containerStyle={{ zIndex: 1000 }}
            />
          </>
        )}
        <Text style={styles.text}> באילו שעות ביום את/ה בדר״כ שותה קפה?</Text>
        <Text style={styles.textOption}>*בחירת אופציה מרובה</Text>
        <MultiSelect
          style={[
            styles.dropdown,
            errors.selfDescription && styles.errorField,
            { zIndex: 1000 },
          ]}
          data={timesPerDay}
          labelField="label"
          valueField="value"
          placeholder="בחר זמן"
          value={coffeeData.consumptionTime || []}
          onChange={(item) => {
            handleInputChange("consumptionTime", item);
            setErrors((prev) => {
              const updated = { ...prev };
              delete updated.selfDescription;
              return updated;
            });
          }}
          placeholderStyle={styles.placeholderText}
          selectedTextStyle={styles.selectedText}
          selectedStyle={{
            flexDirection: "row-reverse",
            justifyContent: "flex-end",
            alignItems: "center",
          }}
          itemTextStyle={{
            textAlign: "right",
            textDirection: "rtl",
          }}
          containerStyle={{ zIndex: 1000 }}
        />
        {errors.consumptionTime && (
          <Text style={{ color: "red" }}>{errors.consumptionTime}</Text>
        )}
        <Text style={styles.text}>
          האם שתיית הקפה משפיעה עליך רגשית / פיזית / שניהם?
        </Text>
        <Dropdown
          style={[styles.dropdown, errors.effects && styles.errorField]}
          data={effectsOptions}
          labelField="label"
          valueField="value"
          placeholder="בחר אופציה מתאימה"
          value={effects}
          onChange={(item) => {
            setEffects(item.value);
            setErrors((prev) => {
              const updated = { ...prev };
              delete updated.effects;
              return updated;
            });
          }}
          placeholderStyle={styles.placeholderText}
          selectedTextStyle={styles.selectedText}
        />
        {errors.effects && (
          <Text style={{ color: "red" }}>{errors.effects}</Text>
        )}

        <Text style={styles.text}> האם אתה מנסה להפחית צריכת קפה?</Text>
        <RadioGroup
          radioButtons={yesNoOptions}
          onPress={(val) => {
            setIsTryingToReduce(val);
            setErrors((prev) => {
              const updated = { ...prev };
              delete updated.isWorking;
              return updated;
            });
          }}
          selectedId={isTryingToReduce}
          layout="row"
        />
        {errors.isTryingToReduce && (
          <Text style={{ color: "red" }}>{errors.isTryingToReduce}</Text>
        )}
        {isTryingToReduce === "yes" && (
          <View>
            <Text style={styles.text}> איך אתה מנסה להפחית צריכת קפה?</Text>
            <TextInput
              placeholder="למשל: מחליף לקפה נטול, שותה תה במקום..."
              value={reductionExplanation}
              onChangeText={(text) => {
                setReductionExplanation(text);
                setErrors((prev) => {
                  const updated = { ...prev };
                  delete updated.reductionExplanation;
                  return updated;
                });
              }}
              style={[
                styles.input,
                errors.reductionExplanation && styles.errorField,
              ]}
            />
            {errors.reductionExplanation && (
              <Text style={{ color: "red" }}>
                {errors.reductionExplanation}
              </Text>
            )}
          </View>
        )}
        <Text style={styles.text}>
          כמה חשוב לך לעקוב אחרי הרגלי צריכת הקפה שלך?
        </Text>
        <Dropdown
          style={[styles.dropdown, errors.importanceLevel && styles.errorField]}
          data={importanceLevels}
          labelField="label"
          valueField="value"
          placeholder="בחר רמת חשיבות"
          value={importanceLevel}
          onChange={(item) => {
            handleImportanceChange(item); // ← כאן צריך לקרוא לפונקציה
            setErrors((prev) => {
              const updated = { ...prev };
              delete updated.importanceLevel;
              return updated;
            });
          }}
          placeholderStyle={styles.placeholderText}
          selectedTextStyle={styles.selectedText}
        />
        {errors.importanceLevels && (
          <Text style={{ color: "red" }}>{errors.importanceLevels}</Text>
        )}
        <Text style={styles.text}> סוגי קפה מועדפים:</Text>
        <Text style={styles.textOption}>*בחירת אופציה מרובה</Text>
        <MultiSelect
          style={[
            styles.dropdown,
            errors.coffeeType && styles.errorField,
            { zIndex: 1000 },
          ]}
          data={coffeeOptions}
          labelField="label"
          valueField="value"
          placeholder="בחר סוגי קפה"
          value={coffeeData.coffeeType}
          onChange={(selectedTypes) => {
            handleInputChange("coffeeType", selectedTypes);

            // יוצרים map חדש של serving sizes לפי סוגים שנבחרו
            const newServingMap = {};
            selectedTypes.forEach((type) => {
              newServingMap[type] = servingSizesByType[type] || null;
            });
            setServingSizesByType(newServingMap);

            setErrors((prev) => {
              const updated = { ...prev };
              delete updated.selfDescription;
              return updated;
            });
          }}
          placeholderStyle={styles.placeholderText}
          selectedTextStyle={styles.selectedText}
          selectedStyle={{
            flexDirection: "row-reverse",
            justifyContent: "flex-end",
            alignItems: "center",
          }}
          itemTextStyle={{
            textAlign: "right",
            textDirection: "rtl",
          }}
          containerStyle={{ zIndex: 1000 }}
        />
        {errors.coffeeType && (
          <Text style={{ color: "red" }}>{errors.coffeeType}</Text>
        )}
        {coffeeData.coffeeType.length > 0 && (
          <View style={{ marginTop: 10 }}>
            <Text style={styles.text}> בחר/י מידת הגשה עבור כל סוג קפה:</Text>
            {coffeeData.coffeeType.map((name) => (
              <View key={name} style={{ marginVertical: 8 }}>
                <Text
                  style={{ marginBottom: 4, textAlign: "right", color: "gray" }}
                >
                  סוג:{" "}
                  {coffeeTypesFromDb.find((c) => c.value === name)?.name ||
                    name}
                </Text>
                <Dropdown
                  data={servingSizes}
                  labelField="label"
                  valueField="value"
                  placeholder="בחר מידה"
                  value={servingSizesByType[name] || null}
                  onChange={(item) => {
                    setServingSizesByType((prev) => ({
                      ...prev,
                      [name]: item.value,
                    }));
                  }}
                  placeholderStyle={styles.placeholderText}
                  selectedTextStyle={styles.selectedText}
                  style={styles.dropdown}
                />
                <Text style={styles.text}>בחר כמות כוסות קפה ביום</Text>
                <Dropdown
                  style={[
                    styles.dropdown,
                    errors.cupsByType &&
                      cupsByType[name] == null &&
                      styles.errorField,
                  ]}
                  data={coffeeConsumption}
                  labelField="label"
                  placeholder="בחר כמות"
                  valueField="value"
                  value={cupsByType[name] || null}
                  onChange={(item) => {
                    setCupsByType((prev) => ({
                      ...prev,
                      [name]: item.value,
                    }));
                    setErrors((prev) => {
                      const updated = { ...prev };
                      delete updated.cupsByType;
                      return updated;
                    });
                  }}
                  placeholderStyle={styles.placeholderText}
                  selectedTextStyle={styles.selectedText}
                />
                {errors.cupsByType && (
                  <Text style={{ color: "red" }}>{errors.cupsByType}</Text>
                )}
              </View>
            ))}
          </View>
        )}
        {errors.servingSizesByType && (
          <Text style={{ color: "red" }}>{errors.servingSizesByType}</Text>
        )}
        <Text style={styles.text}>תבחר/י את המשפט שאת/ה הכי מזדהה איתו:</Text>
        <Dropdown
          style={[styles.dropdown, errors.selfDescription && styles.errorField]}
          data={selfDescriptions}
          labelField="label"
          valueField="value"
          placeholder="בחר תיאור"
          value={selfDescription}
          onChange={(item) => {
            setSelfDescription(item.value);
            setErrors((prev) => {
              const updated = { ...prev };
              delete updated.selfDescription;
              return updated;
            });
          }}
          placeholderStyle={styles.placeholderText}
          selectedTextStyle={styles.selectedText}
        />
        {selfDescription === "other" && (
          <TextInput
            placeholder="כתוב/י תיאור משלך"
            value={customDescription}
            onChangeText={(text) => setCustomDescription(text)}
            style={[styles.input, { marginTop: 10 }]}
          />
        )}
        {errors.selfDescription && (
          <Text style={{ color: "red" }}>{errors.selfDescription}</Text>
        )}
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleRegister}
          >
            <Text style={styles.buttonText}>
              {isEditMode ? "עדכן" : "סיום"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1, paddingBottom: 20 },
  container: {
    flex: 1,
    alignItems: "flex-start",
    padding: 20,
    gap: 8,
    flexDirection: "column",
    alignItems: "stretch",
    // direction: "rtl",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    alignSelf: "center",
    marginBottom: 20,
    padding: 10,
  },
  dropdown: {
    height: 50,
    borderColor: "gray",
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginBottom: 5,
    width: "100%",
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
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 20,
    gap: 10,
    borderRadius: 10,
  },
  sleepTimeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 15,
  },
  sleepDropdown: {
    flex: 1,
  },
  errorField: {
    borderColor: "red",
    borderWidth: 1.5,
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  modal: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    minWidth: "70%",
  },
  modalText: {
    fontSize: 18,
    textAlign: "center",
  },
  primaryButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 5,
    borderRadius: 10,
    alignItems: "center",
    flex: 1,
  },

  secondaryButton: {
    backgroundColor: "#888",
    paddingVertical: 12,
    paddingHorizontal: 5,
    borderRadius: 10,
    alignItems: "center",
    flex: 1,
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  placeholderText: {
    textAlign: "right",
    color: "#999",
  },
  selectedText: {
    textAlign: "right",
    color: "#333",
  },
  text: {
    marginBottom: 20,
    fontSize: 18,
    textAlign: "right",
  },
  textOption: {
    fontSize: 16,
    textAlign: "right",
    color: "#184e77",
  },
});
