import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { ThemeProvider, useTheme } from "../contexts/ThemeContext";
import { useAuthStore } from "../stores/authStore";
import SplashScreen from "expo-splash-screen";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

function RootLayout() {
  const { isDark } = useTheme();
  const { loading, isAuthenticated, initAuth } = useAuthStore();

  useEffect(() => {
    const prepare = async () => {
      try {
        await initAuth();
      } catch (e) {
        console.warn(e);
      } finally {
        // This tells the splash screen to hide immediately!
        SplashScreen.hideAsync();
      }
    };

    prepare();
  }, []);

  if (loading) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
        },
      }}
    >
      {isAuthenticated ? (
        <>
          <Stack.Screen name="(tabs)" />
        </>
      ) : (
        <>
          <Stack.Screen name="auth" />
        </>
      )}
    </Stack>
  );
}

export default function Root() {
  return (
    <ThemeProvider>
      <RootLayout />
    </ThemeProvider>
  );
}
