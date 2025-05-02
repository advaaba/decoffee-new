import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import BASE_URL from "../../utils/apiConfig";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMessage("❌ יש למלא את כל השדות!");
      return;
    }

    try {
      console.log("📩 שליחת נתוני התחברות:", { email, password });

      const response = await axios.post(`${BASE_URL}/api/auth/login`, { email, password });

      console.log("✅ תגובת השרת:", response.data);

      if (response.data.success && response.data.token) {
        console.log("🔑 טוקן שהתקבל:", response.data.token);

        // שמירת הטוקן ב- AsyncStorage
        await AsyncStorage.setItem("authToken", response.data.token);
        Alert.alert("✅ התחברת בהצלחה!");
        await AsyncStorage.setItem("userId", response.data.user.userId);
        console.log("🔎 response.data:", response.data);

        router.push("/home-screen");
      } else {
        setErrorMessage("❌ התחברות נכשלה, נסה שוב.");
      }
    } catch (error) {
      console.log("❌ שגיאה בהתחברות:", error.response?.data || error.message);

      if (error.response?.status === 404) {
        setErrorMessage("❌ המשתמש לא נמצא במערכת");
      } else if (error.response?.status === 401) {
        setErrorMessage("❌ סיסמה שגויה");
      } else {
        setErrorMessage("❌ שגיאה בהתחברות");
      }

      Alert.alert(
        "❌ שגיאה",
        error.response?.data?.message || "שגיאה בלתי צפויה"
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔑 התחברות</Text>

      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

      <TextInput
        style={styles.input}
        placeholder="אימייל"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="סיסמה"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Ionicons
            name={showPassword ? "eye-off" : "eye"}
            size={24}
            color="gray"
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => router.push("/PasswordRecovery")}>
        <Text style={styles.link}>שכחת סיסמה?</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>כניסה</Text>
      </TouchableOpacity>


    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    width: "80%",
    height: 50,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingLeft: 10,
    fontSize: 16,
  },
  button: {
    width: "80%",
    padding: 15,
    backgroundColor: "#2196F3",
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
  },
  error: {
    color: "red",
    marginBottom: 10,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "80%",
    height: 50,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 10,
  },

  passwordInput: {
    flex: 1,
    fontSize: 16,
  },
  link: {
    color: "#2196F3",
    textDecorationLine: "underline",
    marginBottom: 10,
  },

});

export default LoginScreen;
