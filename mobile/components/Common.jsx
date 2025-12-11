import React from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useTheme } from "../contexts/ThemeContext";

export const LoadingScreen = () => {
  const { isDark } = useTheme();

  return (
    <View
      className={`flex-1 items-center justify-center ${
        isDark ? "bg-dark" : "bg-light"
      }`}
    >
      <ActivityIndicator size="large" color="#06B6D4" />
      <Text
        className={`mt-4 text-lg font-semibold ${
          isDark ? "text-white" : "text-dark"
        }`}
      >
        Loading...
      </Text>
    </View>
  );
};

export const ErrorScreen = ({ error, onRetry }) => {
  const { isDark } = useTheme();

  return (
    <View
      className={`flex-1 items-center justify-center px-4 ${
        isDark ? "bg-dark" : "bg-light"
      }`}
    >
      <Text
        className={`text-lg font-semibold mb-2 ${
          isDark ? "text-red-400" : "text-red-600"
        }`}
      >
        Oops! Something went wrong
      </Text>
      <Text
        className={`text-center mb-6 ${
          isDark ? "text-gray-400" : "text-gray-600"
        }`}
      >
        {error || "An unexpected error occurred"}
      </Text>
      {onRetry && <Button text="Retry" onPress={onRetry} />}
    </View>
  );
};

export const Button = ({
  text,
  onPress,
  disabled = false,
  variant = "primary",
  size = "md",
}) => {
  const { isDark } = useTheme();

  const baseClasses = "rounded-lg font-semibold items-center justify-center";
  const sizeClasses =
    size === "sm" ? "px-4 py-2" : size === "lg" ? "px-6 py-4" : "px-5 py-3";

  const variantClasses =
    variant === "primary"
      ? "bg-primary"
      : variant === "secondary"
      ? isDark
        ? "bg-gray-700"
        : "bg-gray-200"
      : "bg-error";

  const textColor = variant === "secondary" ? "text-dark" : "text-white";

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${
        disabled ? "opacity-50" : ""
      }`}
      activeOpacity={0.7}
    >
      <Text className={`text-center font-semibold ${textColor}`}>{text}</Text>
    </TouchableOpacity>
  );
};

export const Card = ({ children, className = "" }) => {
  const { isDark } = useTheme();

  return (
    <View
      className={`rounded-lg p-4 ${
        isDark ? "bg-gray-800" : "bg-white"
      } ${className}`}
    >
      {children}
    </View>
  );
};

import { TouchableOpacity } from "react-native";
