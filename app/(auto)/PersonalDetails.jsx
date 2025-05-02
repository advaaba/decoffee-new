import React, { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";

const PersonalDetailsScreen = () => {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    userId: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phoneNumber: "",
  });

  // ✅ בדיקת תקינות תעודת זהות ישראלית
  const validateIsraeliID = (id) => {
    if (!/^\d{9}$/.test(id)) return false; // רק 9 ספרות
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      let num = parseInt(id[i]) * ((i % 2) + 1);
      sum += num > 9 ? num - 9 : num;
    }
    return sum % 10 === 0;
  };

  // ✅ בדיקת מספר טלפון ישראלי
  const validatePhoneNumber = (phone) => /^05\d{8}$/.test(phone);

  // ✅ בדיקת אימייל
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // 🔄 פונקציה לבדיקת הטופס
  const validateForm = () => {
    let newErrors = {};

    if (!validateIsraeliID(formData.userId)) {
      newErrors.userId = "⚠️ מספר תעודת זהות אינו תקין";
    }
    if (!formData.firstName.trim()) {
      newErrors.firstName = "⚠️ יש למלא שם פרטי";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "⚠️ יש למלא שם משפחה";
    }
    if (!validateEmail(formData.email)) {
      newErrors.email = "⚠️ כתובת מייל לא תקינה";
    }
    if (!validatePhoneNumber(formData.phoneNumber)) {
      newErrors.phoneNumber =
        "⚠️ מספר טלפון אינו תקין (יש להזין 10 ספרות בפורמט ישראלי)";
    }
    if (formData.password.length < 6) {
      newErrors.password = "⚠️ הסיסמה חייבת להיות לפחות 6 תווים";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 📝 פונקציה לעדכון שדות ומחיקת שגיאות
  const handleInputChange = (key, value) => {
    setFormData({ ...formData, [key]: value });

    if (errors[key]) {
      setErrors((prevErrors) => ({ ...prevErrors, [key]: "" }));
    }
  };

  // ⚠️ הצגת הודעת שגיאה במודל
  const showAlert = (message) => {
    setModalMessage(message);
    setModalVisible(true);
  };

  // 🔄 ניהול מעבר למסך הבא
  const handleContinue = () => {
    if (!validateForm()) {
      showAlert("❌ אנא תקני את השדות המסומנים לפני המעבר.");
      return;
    }
    console.log(formData);
    router.push({ pathname: "/HealthDetails", params: formData }); // 👈 שולחים את הנתונים ל-HealthDetails
  };
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>יצירת חשבון משתמש</Text>

        <TextInput
          style={styles.input}
          placeholder="תעודת זהות"
          value={formData.userId}
          onChangeText={(value) => handleInputChange("userId", value)}
          keyboardType="numeric"
        />
        {errors.userId && <Text style={styles.errorText}>{errors.userId}</Text>}

        <TextInput
          style={styles.input}
          placeholder="שם פרטי"
          value={formData.firstName}
          onChangeText={(value) => handleInputChange("firstName", value)}
        />
        {errors.firstName && (
          <Text style={styles.errorText}>{errors.firstName}</Text>
        )}

        <TextInput
          style={styles.input}
          placeholder="שם משפחה"
          value={formData.lastName}
          onChangeText={(value) => handleInputChange("lastName", value)}
        />
        {errors.lastName && (
          <Text style={styles.errorText}>{errors.lastName}</Text>
        )}

        <TextInput
          style={styles.input}
          placeholder="דואל"
          value={formData.email}
          onChangeText={(value) => handleInputChange("email", value)}
          keyboardType="email-address"
        />
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

        <TextInput
          style={styles.input}
          placeholder="מספר טלפון"
          value={formData.phoneNumber}
          onChangeText={(value) => handleInputChange("phoneNumber", value)}
          keyboardType="phone-pad"
        />
        {errors.phoneNumber && (
          <Text style={styles.errorText}>{errors.phoneNumber}</Text>
        )}

        <TextInput
          style={styles.input}
          placeholder="סיסמה"
          value={formData.password}
          onChangeText={(value) => handleInputChange("password", value)}
          secureTextEntry
        />
        {errors.password && (
          <Text style={styles.errorText}>{errors.password}</Text>
        )}

        <TouchableOpacity style={styles.button} onPress={handleContinue}>
          <Text style={styles.buttonText}>המשך</Text>
        </TouchableOpacity>

        {/* ✅ מודל מתוקן למניעת שגיאות */}
        <Modal visible={modalVisible} transparent animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>{modalMessage}</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>סגור</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1, paddingBottom: 20 },
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  input: {
    height: 50,
    borderColor: "#ddd",
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    fontSize: 16,
    textAlign: "right",
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
  },
  errorText: { color: "red", fontSize: 14, marginBottom: 10 },
  button: {
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    alignItems: "center",
  },
  buttonText: { color: "#FFF", fontSize: 18, fontWeight: "bold" },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalText: { fontSize: 18, marginBottom: 10 },
  closeButton: { backgroundColor: "#007BFF", padding: 10, borderRadius: 5 },
  closeButtonText: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
});

export default PersonalDetailsScreen;
