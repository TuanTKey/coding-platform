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

export default function LoginScreen() {
  const { isDark } = useTheme();
  const router = useRouter();
  const { login, loading } = useAuthStore();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    setError("");

    if (!formData.username || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      await login(formData);
      router.replace("/(tabs)/problems");
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Login failed");
    }
  };

  return (
    <Container className="bg-gradient-to-br from-primary/10 to-secondary/10">
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1 px-6 py-12"
      >
        {/* Logo */}
        <View className="items-center mb-12 pt-12">
          <Text
            className={`text-4xl font-black mb-3 ${
              isDark ? "text-primary" : "text-primary"
            }`}
          >
            CodeBattle
          </Text>
          <Text
            className={`text-lg ${isDark ? "text-gray-400" : "text-gray-600"}`}
          >
            Master Programming Skills
          </Text>
        </View>

        {/* Form */}
        <View className="mb-8">
          <FormGroup label="Username">
            <Input
              placeholder="Enter your username"
              value={formData.username}
              onChangeText={(text) =>
                setFormData({ ...formData, username: text })
              }
              editable={!loading}
            />
          </FormGroup>

          <FormGroup label="Password">
            <View className="relative">
              <Input
                placeholder="Enter your password"
                value={formData.password}
                onChangeText={(text) =>
                  setFormData({ ...formData, password: text })
                }
                secureTextEntry={!showPassword}
                editable={!loading}
              />
            </View>
          </FormGroup>

          {error && (
            <View className="mb-4 p-3 bg-red-100 rounded-lg">
              <Text className="text-red-600 text-sm">{error}</Text>
            </View>
          )}

          <Button
            text={loading ? "Logging in..." : "Login"}
            onPress={handleLogin}
            disabled={loading}
          />
        </View>

        {/* Register Link */}
        <View className="items-center">
          <Text className={isDark ? "text-gray-400" : "text-gray-600"}>
            Don't have an account?{" "}
          </Text>
          <Link href="/auth/register" asChild>
            <TouchableOpacity>
              <Text className="text-primary font-semibold mt-1">
                Register here
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </Container>
  );
}
