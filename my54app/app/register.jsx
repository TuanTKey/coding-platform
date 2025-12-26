import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ScrollView,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { register as registerApi } from '../services/authService';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const RegisterScreen = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    userClass: '',
    studentId: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  const router = useRouter();

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRegister = async () => {
    // Validation
    const requiredFields = ['username', 'email', 'password', 'fullName'];
    const emptyFields = requiredFields.filter(field => !formData[field].trim());
    
    if (emptyFields.length > 0) {
      Alert.alert('Thông báo', 'Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Thông báo', 'Vui lòng nhập email hợp lệ');
      return;
    }

    // Password strength
    if (formData.password.length < 6) {
      Alert.alert('Thông báo', 'Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setIsLoading(true);
    
    try {
      const data = await registerApi({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        class: formData.userClass,
        studentId: formData.studentId
      });
      
      Alert.alert(
        'Đăng ký thành công',
        'Tài khoản của bạn đã được tạo. Bạn có thể đăng nhập ngay!',
        [
          {
            text: 'Đăng nhập',
            onPress: () => router.replace('/login')
          }
        ]
      );
    } catch (err) {
      Alert.alert('Đăng ký thất bại', err.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderInput = (field, label, placeholder, options = {}) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>
        {label}
        {options.required && <Text style={styles.required}> *</Text>}
      </Text>
      <TextInput
        style={[
          styles.input,
          focusedInput === field && styles.inputFocused
        ]}
        placeholder={placeholder}
        placeholderTextColor="#999"
        value={formData[field]}
        onChangeText={(value) => handleChange(field, value)}
        onFocus={() => setFocusedInput(field)}
        onBlur={() => setFocusedInput(null)}
        autoCapitalize={options.autoCapitalize || 'none'}
        keyboardType={options.keyboardType || 'default'}
        secureTextEntry={field === 'password' && !showPassword}
        {...options}
      />
      {field === 'password' && (
        <TouchableOpacity 
          style={styles.eyeIcon}
          onPress={() => setShowPassword(!showPassword)}
        >
          <Ionicons 
            name={showPassword ? "eye-off-outline" : "eye-outline"} 
            size={22} 
            color="#666" 
          />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Tạo tài khoản</Text>
              <Text style={styles.subtitle}>Điền thông tin để bắt đầu sử dụng</Text>
            </View>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {renderInput('username', 'Tên đăng nhập', 'Nhập tên đăng nhập', { required: true })}
            {renderInput('email', 'Email', 'example@email.com', { 
              required: true, 
              keyboardType: 'email-address' 
            })}
            {renderInput('password', 'Mật khẩu', 'Nhập mật khẩu', { 
              required: true,
              secureTextEntry: true 
            })}
            {renderInput('fullName', 'Họ và tên', 'Nguyễn Văn A', { 
              required: true,
              autoCapitalize: 'words' 
            })}
            {renderInput('userClass', 'Lớp', 'VD: CNTT K15', { autoCapitalize: 'characters' })}
            {renderInput('studentId', 'Mã số sinh viên', 'Nhập mã số sinh viên')}

            {/* Terms and conditions */}
            <View style={styles.termsContainer}>
              <Ionicons name="information-circle-outline" size={18} color="#666" />
              <Text style={styles.termsText}>
                Bằng việc đăng ký, bạn đồng ý với điều khoản sử dụng
              </Text>
            </View>

            {/* Register button */}
            <TouchableOpacity 
              style={[styles.registerButton, isLoading && styles.registerButtonDisabled]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              <LinearGradient
                colors={['#28a745', '#20c997']}
                style={styles.gradientButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="person-add-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.registerButtonText}>Tạo tài khoản</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Login link */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Đã có tài khoản? </Text>
                <TouchableOpacity onPress={() => router.replace('/login')} style={styles.switchBtn}>
                <Text style={styles.loginLink}>Đăng nhập ngay</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 30,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  formContainer: {
    paddingHorizontal: 24,
  },
  inputContainer: {
    marginBottom: 20,
    position: 'relative',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  required: {
    color: '#dc3545',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
    borderWidth: 1.5,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputFocused: {
    borderColor: '#28a745',
    backgroundColor: '#fff',
    shadowColor: '#28a745',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 42,
    padding: 4,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
  },
  termsText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  registerButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#28a745',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  registerButtonDisabled: {
    opacity: 0.7,
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  loginText: {
    color: '#666',
    fontSize: 15,
  },
  loginLink: {
    color: '#007bff',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default RegisterScreen;