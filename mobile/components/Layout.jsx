import React from "react";
import { View, Text, ScrollView } from "react-native";
import { useTheme } from "../contexts/ThemeContext";

export const Container = ({ children, className = "" }) => {
  const { isDark } = useTheme();

  return (
    <View className={`flex-1 ${isDark ? "bg-dark" : "bg-light"} ${className}`}>
      {children}
    </View>
  );
};

export const SafeContainer = ({ children, className = "" }) => {
  const { isDark } = useTheme();

  return (
    <ScrollView
      className={`flex-1 ${isDark ? "bg-dark" : "bg-light"} ${className}`}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
};

export const Header = ({ title, subtitle, className = "" }) => {
  const { isDark } = useTheme();

  return (
    <View className={`px-4 py-6 ${className}`}>
      <Text
        className={`text-3xl font-bold ${isDark ? "text-white" : "text-dark"}`}
      >
        {title}
      </Text>
      {subtitle && (
        <Text
          className={`mt-2 text-base ${
            isDark ? "text-gray-400" : "text-gray-600"
          }`}
        >
          {subtitle}
        </Text>
      )}
    </View>
  );
};
