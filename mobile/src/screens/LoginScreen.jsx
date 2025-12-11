import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../stores/authStore';
import { GradientButton } from '../components/Button';

export function LoginScreen({ navigation }) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const { login, isLoading, error, clearError } = useAuthStore();

  const handleLogin = async () => {
    const result = await login(email, password);
    if (result.success) {
      navigation.replace('MainStack');
    }
  };

  React.useEffect(() => {
    return () => clearError();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CodeJudge</Text>
      <Text style={styles.subtitle}>Online Coding Platform</Text>

      {error && <Text style={styles.error}>{error}</Text>}

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInputField
            placeholder="your@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            editable={!isLoading}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInputField
            placeholder="Enter password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!isLoading}
          />
        </View>

        <GradientButton
          onPress={handleLogin}
          title={isLoading ? 'Logging in...' : 'Login'}
          style={styles.loginButton}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Don't have account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.registerLink}>Register</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function TextInputField({ style, ...props }) {
  return (
    <TextInput
      style={[styles.input, style]}
      placeholderTextColor="#999"
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
    marginBottom: 40,
    textAlign: 'center',
  },
  form: {
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  loginButton: {
    marginTop: 20,
  },
  error: {
    color: '#f5576c',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerText: {
    color: '#666',
  },
  registerLink: {
    color: '#667eea',
    fontWeight: '600',
  },
});

import { TextInput } from 'react-native';
