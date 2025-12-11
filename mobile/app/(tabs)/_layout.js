import React from "react";
import { Tabs } from "expo-router";
import { useTheme } from "../../contexts/ThemeContext";
import { BookOpen, Trophy, User, Settings } from "lucide-react";

export default function TabsLayout() {
  const { isDark } = useTheme();

  const screenOptions = {
    tabBarActiveTintColor: "#06B6D4",
    tabBarInactiveTintColor: isDark ? "#6B7280" : "#9CA3AF",
    tabBarStyle: {
      backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
      borderTopColor: isDark ? "#374151" : "#E5E7EB",
      borderTopWidth: 1,
    },
    headerShown: false,
  };

  return (
    <Tabs screenOptions={screenOptions}>
      <Tabs.Screen
        name="problems"
        options={{
          title: "Problems",
          tabBarIcon: ({ color }) => <BookOpen size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="contests"
        options={{
          title: "Contests",
          tabBarIcon: ({ color }) => <Trophy size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="submissions"
        options={{
          title: "Submissions",
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <Settings size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
