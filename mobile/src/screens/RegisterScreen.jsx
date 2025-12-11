import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { useAuthStore } from '../stores/authStore';
import { GradientButton } from '../components/Button';

export function RegisterScreen({ navigation }) {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [role, setRole] = React.useState('student');
  const { register, isLoading, error, clearError } = useAuthStore();

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    const result = await register(name, email, password, role);
    if (result.success) {
      navigation.replace('MainStack');
    }
  };

  React.useEffect(() => {
    return () => clearError();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Create Account</Text>

        {error && <Text style={styles.error}>{error}</Text>}

        <View style={styles.form}>
          <InputField
            label="Full Name"
            placeholder="John Doe"
            value={name}
            onChangeText={setName}
            editable={!isLoading}
          />

          <InputField
            label="Email"
            placeholder="your@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            editable={!isLoading}
          />

          <InputField
            label="Password"
            placeholder="Enter password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!isLoading}
          />

          <InputField
            label="Confirm Password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            editable={!isLoading}
          />

          <View style={styles.roleGroup}>
            <Text style={styles.label}>Role</Text>
            <View style={styles.roleButtons}>
              <TouchableOpacity
                style={[styles.roleButton, role === 'student' && styles.roleButtonActive]}
                onPress={() => setRole('student')}
                disabled={isLoading}
              >
                <Text style={[styles.roleButtonText, role === 'student' && styles.roleButtonTextActive]}>
                  Student
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.roleButton, role === 'teacher' && styles.roleButtonActive]}
                onPress={() => setRole('teacher')}
                disabled={isLoading}
              >
                <Text style={[styles.roleButtonText, role === 'teacher' && styles.roleButtonTextActive]}>
                  Teacher
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <GradientButton
            onPress={handleRegister}
            title={isLoading ? 'Creating account...' : 'Register'}
            style={styles.registerButton}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

function InputField({ label, style, ...props }) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, style]}
        placeholderTextColor="#999"
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
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
  roleGroup: {
    marginBottom: 20,
  },
  roleButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  roleButtonActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
  },
  roleButtonTextActive: {
    color: '#fff',
  },
  registerButton: {
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
    marginTop: 20,
  },
  footerText: {
    color: '#666',
  },
  loginLink: {
    color: '#667eea',
    fontWeight: '600',
  },
});
