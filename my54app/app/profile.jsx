import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, StatusBar, ActivityIndicator, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) throw new Error('Chưa đăng nhập');
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

  // Lấy các trường thông tin
  const fullName = user.fullName || user.name || user.username || user.sub || '';
  const username = user.username || user.sub || '';
  const email = user.email || '';
  const userClass = user.class || user.userClass || user.lop || '';
  const studentId = user.studentId || user.mssv || user.id || '';
  const joinDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '';
  const role = user.role || '';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.profileTitle}>Hồ sơ cá nhân</Text>
        <View style={styles.profileCard}>
          <View style={styles.avatarBox}>
            <Text style={styles.avatarText}>{fullName.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={styles.fullName}>{fullName}</Text>
          <Text style={styles.username}>@{username}</Text>
          {email ? <Text style={styles.infoRow}><Ionicons name="mail-outline" size={16} color="#fff" />  {email}</Text> : null}
          {userClass ? <Text style={styles.infoRow}><Ionicons name="school-outline" size={16} color="#fff" />  Lớp: {userClass}</Text> : null}
          {studentId ? <Text style={styles.infoRow}><Ionicons name="id-card-outline" size={16} color="#fff" />  Mã số SV: {studentId}</Text> : null}
          {joinDate ? <Text style={styles.infoRow}><Ionicons name="calendar-outline" size={16} color="#fff" />  Tham gia: {joinDate}</Text> : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin bổ sung</Text>
          <View style={styles.roleBox}>
            <Text style={styles.roleLabel}>Vai trò:</Text>
            <Text style={styles.roleValue}>{role.charAt(0).toUpperCase() + role.slice(1)}</Text>
          </View>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.backButton}>
            <Text style={styles.backButtonText}>← Quay lại</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>✏️ Chỉnh sửa</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#181f2a',
  },
  scrollContent: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#181f2a',
    minHeight: '100%',
  },
  profileTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 24,
    marginTop: 8,
  },
  profileCard: {
    backgroundColor: '#232c3b',
    borderRadius: 18,
    padding: 28,
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  avatarBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007bff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
  },
  fullName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  username: {
    fontSize: 16,
    color: '#b0b8c1',
    marginBottom: 10,
  },
  infoRow: {
    color: '#fff',
    fontSize: 15,
    marginBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  section: {
    backgroundColor: '#232c3b',
    borderRadius: 14,
    padding: 18,
    width: '100%',
    marginBottom: 18,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  roleBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleLabel: {
    color: '#b0b8c1',
    fontSize: 15,
    marginRight: 8,
  },
  roleValue: {
    color: '#fff',
    fontSize: 15,
    backgroundColor: '#2d3a4d',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 2,
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginTop: 10,
    gap: 12,
  },
  backButton: {
    backgroundColor: '#232c3b',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginRight: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 15,
  },
  editButton: {
    backgroundColor: '#007bff',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#181f2a',
  },
});
