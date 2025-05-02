import React, { Component } from "react";
import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen name="open-screen" options={{ title: "דף פתיחה" }} />
      <Stack.Screen name="login" options={{ title: "התחברות" }} />
      <Stack.Screen name="PersonalDetails" options={{ title: "הרשמה" }} />
      <Stack.Screen name="HealthDetails" options={{ title: "המשך הרשמה" }} />
      <Stack.Screen name="PasswordRecovery" options={{ title: "שחזור סיסמא" }} />
    </Stack>
  );
}
