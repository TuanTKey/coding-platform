import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Text, SafeAreaView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../store/slices/authSlice';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { ErrorAlert } from '../components/Alerts';

const CLASSES = ['10A1', '10A2', '10A3', '10A4', '10A5', '11A1', '11A2', '11A3', '11A4', '11A5', '12A1', '12A2', '12A3', '12A4', '12A5'];

export const RegisterScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    userClass: '',
    studentId: '',
  });
  const [validationErrors, setValidationErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    if (!formData.username.trim()) errors.username = 'Username is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email is invalid';
    if (formData.password.length < 6) errors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    if (!formData.fullName.trim()) errors.fullName = 'Full name is required';
    if (!formData.userClass) errors.userClass = 'Class is required';

    return errors;
  };

  const handleRegister = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      await dispatch(registerUser(formData)).unwrap();
    } catch (err) {
      // Error is handled by redux
    }
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    setValidationErrors({ ...validationErrors, [field]: undefined });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join CodeJudge Community</Text>
        </View>

        <View style={styles.formContainer}>
          <ErrorAlert message={error} />

          <Input
            label="Username"
            placeholder="Choose a username"
            value={formData.username}
            onChangeText={(value) => handleInputChange('username', value)}
            error={validationErrors.username}
          />

          <Input
            label="Email"
            placeholder="your@email.com"
            value={formData.email}
            onChangeText={(value) => handleInputChange('email', value)}
            keyboardType="email-address"
            error={validationErrors.email}
          />

          <Input
            label="Full Name"
            placeholder="Your full name"
            value={formData.fullName}
            onChangeText={(value) => handleInputChange('fullName', value)}
            error={validationErrors.fullName}
          />

          <View style={styles.classSelector}>
            <Text style={styles.label}>Class</Text>
            <View style={styles.classGrid}>
              {CLASSES.map((cls) => (
                <Text
                  key={cls}
                  style={[
                    styles.classButton,
                    formData.userClass === cls && styles.classButtonActive,
                  ]}
                  onPress={() => handleInputChange('userClass', cls)}
                >
                  {cls}
                </Text>
              ))}
            </View>
            {validationErrors.userClass && (
              <Text style={styles.error}>{validationErrors.userClass}</Text>
            )}
          </View>

          <Input
            label="Student ID (Optional)"
            placeholder="Your student ID"
            value={formData.studentId}
            onChangeText={(value) => handleInputChange('studentId', value)}
          />

          <Input
            label="Password"
            placeholder="At least 6 characters"
            value={formData.password}
            onChangeText={(value) => handleInputChange('password', value)}
            secureTextEntry
            error={validationErrors.password}
          />

          <Input
            label="Confirm Password"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChangeText={(value) => handleInputChange('confirmPassword', value)}
            secureTextEntry
            error={validationErrors.confirmPassword}
          />

          <Button
            title="Create Account"
            onPress={handleRegister}
            loading={loading}
            style={styles.registerButton}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Text
              style={styles.linkText}
              onPress={() => navigation.navigate('Login')}
            >
              Log in
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flexGrow: 1,
    paddingVertical: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  formContainer: {
    paddingHorizontal: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  classSelector: {
    marginBottom: 16,
  },
  classGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  classButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    overflow: 'hidden',
  },
  classButtonActive: {
    backgroundColor: '#0891b2',
    borderColor: '#0891b2',
    color: '#fff',
  },
  error: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
  },
  registerButton: {
    width: '100%',
    marginBottom: 24,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#6b7280',
  },
  linkText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0891b2',
  },
});
