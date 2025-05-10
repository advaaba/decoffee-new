import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  TextInput,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
import BASE_URL from "../../utils/apiConfig";
import { Dropdown } from "react-native-element-dropdown";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [editedUser, setEditedUser] = useState({});
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const router = useRouter();

  const [day, setDay] = useState(null);
  const [month, setMonth] = useState(null);
  const [year, setYear] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) {
          Alert.alert("שגיאה", "לא נמצאו נתוני משתמש");
          return;
        }
        const response = await axios.get(
          `${BASE_URL}/api/auth/get-user/${userId}`
        );
        if (response.data.success) {
          const birthDate = new Date(response.data.user.birthDate);
          setDay(Number(birthDate.getDate()));
          setMonth(Number(birthDate.getMonth() + 1));
          setYear(Number(birthDate.getFullYear()));

          setUser(response.data.user);
          setEditedUser(response.data.user);
        } else {
          Alert.alert("שגיאה", "לא ניתן לטעון את פרטי המשתמש");
        }
      } catch (err) {
        console.error("❌ שגיאה בשליפת נתונים:", err);
        Alert.alert("שגיאה", "בעיה בטעינת נתונים מהשרת");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleFieldChange = (field, value) => {
    setEditedUser((prev) => ({ ...prev, [field]: value }));
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

  const updateBirthDate = (newDay = day, newMonth = month, newYear = year) => {
    if (newDay && newMonth && newYear) {
      const newDate = new Date(newYear, newMonth - 1, newDay);
      const today = new Date();
      let calculatedAge = today.getFullYear() - newDate.getFullYear();
      const m = today.getMonth() - newDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < newDate.getDate())) {
        calculatedAge--;
      }

      setEditedUser((prev) => ({
        ...prev,
        birthDate: newDate.toISOString(),
        age: calculatedAge,
      }));
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("he-IL", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const handleEditToggle = async () => {
    if (editMode) {
      try {
        await axios.put(
          `${BASE_URL}/api/auth/update-user/${editedUser.userId}`,
          editedUser
        );
        setUser(editedUser);
        Alert.alert( "הפרטים עודכנו בהצלחה במסד הנתונים");
      } catch (err) {
        Alert.alert("שגיאה", "עדכון נכשל");
        console.error(err);
      }
    }
    setEditMode(!editMode);
  };

  if (loading) return <ActivityIndicator size="large" color="#06b6d4" />;
  if (!user) return <Text style={styles.text}>לא נמצאו נתוני משתמש.</Text>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>👤 פרופיל אישי</Text>

      <View style={styles.card}>
        <InfoRow
          label="שם פרטי"
          value={editedUser.firstName}
          field="firstName"
          editMode={editMode}
          onChange={handleFieldChange}
        />
        <InfoRow
          label="שם משפחה"
          value={editedUser.lastName}
          field="lastName"
          editMode={editMode}
          onChange={handleFieldChange}
        />
        <InfoRow
          label='דוא"ל'
          value={editedUser.email}
          field="email"
          editMode={editMode}
          onChange={handleFieldChange}
        />
        <InfoRow
          label="טלפון"
          value={editedUser.phoneNumber}
          field="phoneNumber"
          editMode={editMode}
          onChange={handleFieldChange}
        />
        <InfoRow
          label="גיל"
          value={editedUser.age?.toString()}
          field="age"
          editMode={false} 
          onChange={handleFieldChange}
        />

        <View style={styles.row}>
          <Text style={styles.label}>תאריך יום הולדת:</Text>
          {editMode ? (
            <View style={{ flexDirection: "row", gap: 10 }}>
                <Dropdown
                  style={[styles.dropdown, { flex: 1 }]}
                  data={days}
                  labelField="label"
                  valueField="value"
                  value={day !== null ? Number(day) : null}

                  onChange={(item) => {
                    setDay(item.value);
                    updateBirthDate(item.value, month, year);
                  }}
                  placeholder="יום"
                  placeholderStyle={{ color: "#999" }}
                  selectedTextStyle={{ color: "#000" }}
                  search={false}
                />
                
                <Dropdown
                  style={[styles.dropdown, { flex: 1 }]}
                  data={months}
                  labelField="label"
                  valueField="value"
                  value={month !== null ? Number(day) : null}
                  onChange={(item) => {
                    setMonth(item.value);
                    updateBirthDate(day, item.value, year);
                  }}
                  placeholder="חודש"
                  placeholderStyle={{ color: "#999" }}
                  selectedTextStyle={{ color: "#000" }}
                />
                <Dropdown
                  style={[styles.dropdown, { flex: 1 }]}
                  data={years}
                  labelField="label"
                  valueField="value"
                  value={year !== null ? Number(day) : null}
                  onChange={(item) => {
                    setYear(item.value);
                    updateBirthDate(day, month, item.value);
                  }}
                  placeholder="שנה"
                  placeholderStyle={{ color: "#999" }}
                  selectedTextStyle={{ color: "#000" }}
                />
              </View>
          ) : (
            <Text style={styles.value}>{formatDate(editedUser.birthDate)}</Text>
          )}
        </View>

        <InfoRow
          label="משקל"
          value={editedUser.weight?.toString()}
          field="weight"
          editMode={editMode}
          onChange={handleFieldChange}
        />
        <InfoRow
          label="גובה"
          value={editedUser.height?.toString()}
          field="height"
          editMode={editMode}
          onChange={handleFieldChange}
        />
      </View>

      <TouchableOpacity style={styles.updateButton} onPress={handleEditToggle}>
        <Text style={styles.updateText}>
          {editMode ? " שמור שינויים" : " עדכון פרטים"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// קומפוננטה לשורת מידע (כולל תמיכה ב-Picker עבור height ו-weight)
const InfoRow = ({ label, value, field, editMode, onChange }) => {
  const isPickerField = field === "weight" || field === "height";

  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}:</Text>
      {editMode ? (
        isPickerField ? (
          <Dropdown
            data={
              field === "weight"
                ? [...Array(121)].map((_, i) => {
                    const val = 30 + i;
                    return { label: `${val} ק"ג`, value: val };
                  })
                : [...Array(121)].map((_, i) => {
                    const val = 100 + i;
                    return { label: `${val} ס"מ`, value: val };
                  })
            }
            labelField="label"
            valueField="value"
            value={value}
            onChange={(item) => onChange(field, item.value)}
            style={styles.dropdown}
            placeholder={`בחר ${label}`}
            placeholderStyle={{ color: "#999" }}
            selectedTextStyle={{ color: "#000" }}
          />
        ) : (
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={(text) => onChange(field, text)}
            placeholder={`הכנס ${label}`}
            keyboardType="default"
          />
        )
      ) : (
        <Text style={styles.value}>{value}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    // backgroundColor: "#f8fafc",
    alignItems: "center",
    minHeight: "100%",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#0f172a",
  },
  card: {
    backgroundColor: "#ffffff",
    width: "100%",
    borderRadius: 18,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 20,
  },
  row: {
    marginBottom: 14,
  },
  label: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1e293b",
  },
  input: {
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    color: "#0f172a",
  },
  picker: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#fff",
  },
  updateButton: {
    backgroundColor: "#0ea5e9",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 12,
    marginBottom: 20,
  },
  updateText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  dropdown: {
    height: 44,
    borderColor: "#e2e8f0",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    marginBottom: 6,
  },
});
