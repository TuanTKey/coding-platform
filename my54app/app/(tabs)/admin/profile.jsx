import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, StatusBar, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function AdminProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) throw new Error('Chưa đăng nhập');
        // Giả lập lấy user từ token (hoặc fetch từ API nếu có endpoint)
        // Ở đây chỉ demo, thực tế nên decode token hoặc fetch user info
        const userData = JSON.parse(atob(token.split('.')[1]));
        setUser(userData);
      } catch (err) {
        Alert.alert('Lỗi', err.message || 'Không thể lấy thông tin người dùng');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={{ marginTop: 12 }}>Đang tải thông tin...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.centered}>
        <Text>Không tìm thấy thông tin người dùng.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.profileContainer}>
        <Ionicons name="person-circle-outline" size={80} color="#007bff" style={{ marginBottom: 16 }} />
        <Text style={styles.name}>{user.fullName || user.username}</Text>
        <Text style={styles.info}>Username: {user.username}</Text>
        <Text style={styles.info}>Email: {user.email || 'Chưa cập nhật'}</Text>
        <Text style={styles.info}>Vai trò: {user.role}</Text>
        {/* Thêm các trường khác nếu có */}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileContainer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 40,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  info: {
    fontSize: 16,
    color: '#555',
    marginBottom: 4,
  },
});
