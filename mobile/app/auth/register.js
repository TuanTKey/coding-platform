import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuthStore } from "../../stores/authStore";
import { Input, FormGroup } from "../../components/Form";
import { Button, Container } from "../../components/Common";

const CLASS_OPTIONS = [
  "10A1",
  "10A2",
  "10A3",
  "10A4",
  "10A5",
  "11A1",
  "11A2",
  "11A3",
  "11A4",
  "11A5",
  "12A1",
  "12A2",
  "12A3",
  "12A4",
  "12A5",
];

export default function RegisterScreen() {
  const { isDark } = useTheme();
  const router = useRouter();
  const { register, loading } = useAuthStore();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    fullName: "",
    class: "",
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showClassPicker, setShowClassPicker] = useState(false);

  const handleRegister = async () => {
    setError("");

    if (
      !formData.username ||
      !formData.email ||
      !formData.password ||
      !formData.class
    ) {
      setError("Please fill in all required fields");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      await register(formData);
      router.replace("/(tabs)/problems");
    } catch (err) {
      setError(
        err.response?.data?.error || err.message || "Registration failed"
      );
    }
  };

  return (
    <Container className="bg-gradient-to-br from-primary/10 to-secondary/10">
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1 px-6 py-8"
      >
        {/* Logo */}
        <View className="items-center mb-8 pt-8">
          <Text
            className={`text-3xl font-black mb-2 ${
              isDark ? "text-primary" : "text-primary"
            }`}
          >
            CodeBattle
          </Text>
          <Text
            className={`text-base ${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Create Your Account
          </Text>
        </View>

        {/* Form */}
        <View className="mb-8">
          <FormGroup label="Full Name">
            <Input
              placeholder="Enter your full name"
              value={formData.fullName}
              onChangeText={(text) =>
                setFormData({ ...formData, fullName: text })
              }
              editable={!loading}
            />
          </FormGroup>

          <FormGroup label="Username">
            <Input
              placeholder="Enter username"
              value={formData.username}
              onChangeText={(text) =>
                setFormData({ ...formData, username: text })
              }
              editable={!loading}
            />
          </FormGroup>

          <FormGroup label="Email">
            <Input
              placeholder="Enter your email"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              editable={!loading}
            />
          </FormGroup>

          <FormGroup label="Password">
            <Input
              placeholder="Enter password (min 6 characters)"
              value={formData.password}
              onChangeText={(text) =>
                setFormData({ ...formData, password: text })
              }
              secureTextEntry={!showPassword}
              editable={!loading}
            />
          </FormGroup>

          <FormGroup label="Class">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-2"
            >
              {CLASS_OPTIONS.map((cls) => (
                <TouchableOpacity
                  key={cls}
                  onPress={() => setFormData({ ...formData, class: cls })}
                  className={`mr-2 px-4 py-2 rounded-lg ${
                    formData.class === cls
                      ? "bg-primary"
                      : isDark
                      ? "bg-gray-800"
                      : "bg-gray-200"
                  }`}
                >
                  <Text
                    className={`font-semibold ${
                      formData.class === cls
                        ? "text-white"
                        : isDark
                        ? "text-gray-300"
                        : "text-gray-700"
                    }`}
                  >
                    {cls}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </FormGroup>

          {error && (
            <View className="mb-4 p-3 bg-red-100 rounded-lg">
              <Text className="text-red-600 text-sm">{error}</Text>
            </View>
          )}

          <Button
            text={loading ? "Registering..." : "Register"}
            onPress={handleRegister}
            disabled={loading}
          />
        </View>

        {/* Login Link */}
        <View className="items-center">
          <Text className={isDark ? "text-gray-400" : "text-gray-600"}>
            Already have an account?{" "}
          </Text>
          <Link href="/auth/login" asChild>
            <TouchableOpacity>
              <Text className="text-primary font-semibold mt-1">
                Login here
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </Container>
  );
}
