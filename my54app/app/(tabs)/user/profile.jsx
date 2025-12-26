
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, StatusBar, ActivityIndicator, Alert, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) throw new Error('Chưa đăng nhập');
        let userData;
        try {
          userData = JSON.parse(atob(token.split('.')[1]));
        } catch {
          userData = null;
        }
        const mockUserStr = await AsyncStorage.getItem('mockUser');
        if (mockUserStr) {
          const mockUser = JSON.parse(mockUserStr);
          setUser(mockUser);
        } else {
          setUser(userData);
        }
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
  const avatar = user.avatar || '';
  const joinDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '';
  const role = user.role || '';

  return (
    <LinearGradient colors={["#232c3b", "#181f2a"]} style={styles.gradientBg}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.profileTitle}>Hồ sơ cá nhân</Text>
          <View style={styles.profileCard}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatarImg} />
            ) : (
              <View style={styles.avatarBox}>
                <Text style={styles.avatarText}>{fullName.charAt(0).toUpperCase()}</Text>
              </View>
            )}
            <Text style={styles.fullName}>{fullName}</Text>
            <Text style={styles.username}>@{username}</Text>
            <View style={styles.infoSection}>
              {email ? <View style={styles.infoRow}><Ionicons name="mail-outline" size={18} color="#007bff" /><Text style={styles.infoText}>{email}</Text></View> : null}
              {userClass ? <View style={styles.infoRow}><Ionicons name="school-outline" size={18} color="#28a745" /><Text style={styles.infoText}>Lớp: {userClass}</Text></View> : null}
              {studentId ? <View style={styles.infoRow}><Ionicons name="id-card-outline" size={18} color="#fd7e14" /><Text style={styles.infoText}>Mã số SV: {studentId}</Text></View> : null}
              {joinDate ? <View style={styles.infoRow}><Ionicons name="calendar-outline" size={18} color="#6f42c1" /><Text style={styles.infoText}>Tham gia: {joinDate}</Text></View> : null}
            </View>
            <View style={styles.roleBox}>
              <Text style={styles.roleLabel}>Vai trò:</Text>
              <Text style={[styles.roleValue, { backgroundColor: '#2d3a4d', color: '#fff' }]}>{role.charAt(0).toUpperCase() + role.slice(1)}</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBg: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    alignItems: 'center',
    padding: 24,
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
  avatarImg: {
    width: 80,
    height: 80,
    borderRadius: 40,
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
  infoSection: {
    width: '100%',
    marginTop: 10,
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoText: {
    color: '#fff',
    fontSize: 15,
    marginLeft: 8,
  },
  roleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#181f2a',
  },
});
