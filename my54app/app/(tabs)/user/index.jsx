import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  StatusBar, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  RefreshControl,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function UserDashboard() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Để tránh lỗi network request failed trên thiết bị/emulator, hãy thay BASE_URL bằng IP LAN của máy tính chạy backend
  // Ví dụ: const BASE_URL = 'http://192.168.1.10:3001'; // Thay 192.168.1.10 bằng IPv4 Address của bạn
const BASE_URL = 'http://10.125.204.93:5000';

  const loadUserInfo = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        router.replace('/login');
        return;
      }

      // Gọi API thực tế để lấy thông tin user và thống kê
      console.log('BASE_URL:', BASE_URL);
      console.log('Token:', token);
      const res = await fetch(`${BASE_URL}/api/users/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      console.log('API status:', res.status);
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error('Lỗi parse JSON: ' + text);
      }
      if (!res.ok) throw new Error(data.message || 'Không thể lấy thông tin người dùng');
      setUserInfo(data);
    } catch (error) {
      console.log('Lỗi loadUserInfo:', error);
      Alert.alert('Lỗi', error.message || 'Không thể tải thông tin người dùng');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadUserInfo();
  }, []);

  const handleLogout = async () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất?', [
      { text: 'Huỷ', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem('token');
          router.replace('/login');
        },
      },
    ]);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadUserInfo();
  };

  const menuItems = [
    {
      title: 'Lớp học của tôi',
      description: 'Xem và tham gia lớp học',
      icon: 'school-outline',
      color: '#007bff',
      route: '/(tabs)/user/classes',
    },
    {
      title: 'Bài tập',
      description: 'Làm bài tập lập trình',
      icon: 'book-outline',
      color: '#28a745',
      route: '/(tabs)/user/problems',
    },
    {
      title: 'Cuộc thi',
      description: 'Tham gia các cuộc thi',
      icon: 'trophy-outline',
      color: '#fd7e14',
      route: '/(tabs)/user/contests',
    },
    {
      title: 'Bài nộp của tôi',
      description: 'Xem lịch sử bài nộp',
      icon: 'document-text-outline',
      color: '#6f42c1',
      route: '/(tabs)/user/submissions',
    },
    {
      title: 'Hồ sơ cá nhân',
      description: 'Quản lý thông tin cá nhân',
      icon: 'person-outline',
      color: '#20c997',
      route: '/(tabs)/user/profile',
    },
  ];

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.loadingContainer}>
          <Ionicons name="school-outline" size={48} color="#007bff" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      
      {/* Header với gradient */}
      <LinearGradient
        colors={['#007bff', '#0056b3']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.headerTop}>
          <View style={styles.userInfo}>
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: userInfo?.avatar || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }}
                style={styles.avatar}
              />
              <View style={styles.statusDot} />
            </View>
            <View style={styles.userText}>
              <Text style={styles.welcomeText}>Xin chào,</Text>
              <Text style={styles.userName}>{userInfo?.fullName || 'Học sinh'}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color="#fff" />
            <View style={styles.notificationBadge}>
              <Text style={styles.badgeText}>3</Text>
            </View>
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>Bảng điều khiển học sinh</Text>
        <Text style={styles.subtitle}>Học tập và luyện tập lập trình</Text>

        {/* Thống kê nhanh */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle" size={20} color="#28a745" />
            <Text style={styles.statNumber}>{userInfo?.stats?.solvedProblems || 0}</Text>
            <Text style={styles.statLabel}>Bài đã giải</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="code-slash" size={20} color="#007bff" />
            <Text style={styles.statNumber}>{userInfo?.stats?.submissions || 0}</Text>
            <Text style={styles.statLabel}>Lần nộp</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="trophy" size={20} color="#fd7e14" />
            <Text style={styles.statNumber}>{userInfo?.stats?.contestsJoined || 0}</Text>
            <Text style={styles.statLabel}>Cuộc thi</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Menu chức năng */}
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.menuGrid}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuCard}
              onPress={() => router.push(item.route)}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={[`${item.color}15`, `${item.color}08`]}
                style={[styles.menuCardContent, { borderLeftColor: item.color }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <View style={[styles.menuIconContainer, { backgroundColor: `${item.color}15` }]}>
                  <Ionicons name={item.icon} size={28} color={item.color} />
                </View>
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuDescription}>{item.description}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* Thông tin cá nhân */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Thông tin cá nhân</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Ionicons name="person-circle-outline" size={16} color="#666" />
              <Text style={styles.infoLabel}>Tên đăng nhập</Text>
              <Text style={styles.infoValue}>{userInfo?.username || 'N/A'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="mail-outline" size={16} color="#666" />
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{userInfo?.email || 'N/A'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="school-outline" size={16} color="#666" />
              <Text style={styles.infoLabel}>Lớp</Text>
              <Text style={styles.infoValue}>{userInfo?.class || 'Chưa có lớp'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="id-card-outline" size={16} color="#666" />
              <Text style={styles.infoLabel}>MSSV</Text>
              <Text style={styles.infoValue}>{userInfo?.studentId || 'Chưa có MSSV'}</Text>
            </View>
          </View>
        </View>

        {/* Hoạt động gần đây */}
        <View style={styles.activityCard}>
          <View style={styles.activityHeader}>
            <Text style={styles.activityTitle}>Hoạt động gần đây</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.activityList}>
            {[
              { title: 'Đã giải bài "Tổng hai số"', time: '10 phút trước' },
              { title: 'Tham gia cuộc thi "Weekly Contest"', time: '2 giờ trước' },
              { title: 'Nộp bài "Sắp xếp mảng"', time: '1 ngày trước' },
              { title: 'Tham gia lớp "CTDL & GT"', time: '3 ngày trước' },
            ].map((activity, index) => (
              <View key={index} style={styles.activityItem}>
                <View style={styles.activityDot} />
                <View style={styles.activityContent}>
                  <Text style={styles.activityText}>{activity.title}</Text>
                  <Text style={styles.activityTime}>{activity.time}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Nút đăng xuất */}
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <LinearGradient
            colors={['#fff', '#f8f9fa']}
            style={styles.logoutGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="log-out-outline" size={22} color="#dc3545" />
            <Text style={styles.logoutText}>Đăng xuất</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Hệ thống học lập trình</Text>
          <Text style={styles.footerSubtext}>© 2024 All rights reserved</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
    fontSize: 16,
  },
  header: {
    paddingTop: StatusBar.currentHeight || 40,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#007bff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: '#fff',
  },
  statusDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#28a745',
    borderWidth: 2,
    borderColor: '#0056b3',
  },
  userText: {
    flexDirection: 'column',
  },
  welcomeText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  userName: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 2,
  },
  notificationButton: {
    padding: 8,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#dc3545',
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0056b3',
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    flex: 1,
    marginHorizontal: 4,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 6,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
    paddingTop: 16,
  },
  menuGrid: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  menuCard: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  menuCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderLeftWidth: 4,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  menuIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  infoItem: {
    width: '50%',
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  activityCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  activityTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  viewAllText: {
    fontSize: 14,
    color: '#007bff',
    fontWeight: '500',
  },
  activityList: {
    paddingLeft: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007bff',
    marginTop: 6,
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: '#666',
  },
  logoutButton: {
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ffcccc',
    backgroundColor: '#fff',
  },
  logoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  logoutText: {
    fontSize: 16,
    color: '#dc3545',
    fontWeight: '600',
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#999',
  },
});