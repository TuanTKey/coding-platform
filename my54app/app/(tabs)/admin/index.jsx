import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Image,
  SafeAreaView,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
const { width } = Dimensions.get('window');
const adminFeatures = [
  { 
    label: 'Quản lý người dùng', 
    route: '/(tabs)/admin/users', 
    icon: 'people-outline',
    description: 'Quản lý thông tin người dùng và phân quyền',
    color: '#007bff'
  },
  { 
    label: 'Quản lý bài tập', 
    route: '/(tabs)/admin/problems', 
    icon: 'document-text-outline',
    description: 'Tạo và quản lý các bài tập lập trình',
    color: '#28a745'
  },
  { 
    label: 'Quản lý cuộc thi', 
    route: '/(tabs)/admin/contests', 
    icon: 'trophy-outline',
    description: 'Tổ chức và quản lý các cuộc thi',
    color: '#fd7e14'
  },
  { 
    label: 'Quản lý bài nộp', 
    route: '/(tabs)/admin/submissions', 
    icon: 'paper-plane-outline',
    description: 'Xem và đánh giá bài nộp của người dùng',
    color: '#6f42c1'
  },
  { 
    label: 'Quản lý lớp học', 
    route: '/(tabs)/admin/class', 
    icon: 'school-outline',
    description: 'Quản lý các lớp học và thành viên',
    color: '#20c997'
  },
];


// API thực tế, thay đổi BASE_URL nếu cần
const BASE_URL = 'http://10.125.204.93:5000/api';

const getUsers = async (token) => {
  const res = await fetch(`${BASE_URL}/users`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Lỗi lấy danh sách người dùng');
  return await res.json();
};

const getProblems = async (token) => {
  const res = await fetch(`${BASE_URL}/problems`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Lỗi lấy danh sách bài tập');
  return await res.json();
};

const getContests = async (token) => {
  const res = await fetch(`${BASE_URL}/contests`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Lỗi lấy danh sách cuộc thi');
  return await res.json();
};

function QuickStats() {
  const [counts, setCounts] = useState({ users: 0, problems: 0, contests: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) throw new Error('Không tìm thấy token, vui lòng đăng nhập lại.');
        
        const [users, problems, contests] = await Promise.all([
          getUsers(token),
          getProblems(token),
          getContests(token)
        ]);
        setCounts({
          users: Array.isArray(users?.users) ? users.users.length : 0,
          problems: Array.isArray(problems?.problems) ? problems.problems.length : 0,
          contests: Array.isArray(contests?.contests) ? contests.contests.length : 0
        });
      } catch (err) {
        setError(err.message || 'Lỗi khi tải thống kê');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <View style={styles.quickStats}>
        <View style={styles.statCard}>
          <ActivityIndicator size="small" color="#007bff" />
          <Text style={[styles.statLabel, { marginTop: 8 }]}>Đang tải...</Text>
        </View>
        <View style={styles.statCard}>
          <ActivityIndicator size="small" color="#28a745" />
          <Text style={[styles.statLabel, { marginTop: 8 }]}>Đang tải...</Text>
        </View>
        <View style={styles.statCard}>
          <ActivityIndicator size="small" color="#fd7e14" />
          <Text style={[styles.statLabel, { marginTop: 8 }]}>Đang tải...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.quickStats}>
        <View style={[styles.statCard, { flex: 3, marginHorizontal: 0 }]}>
          <Ionicons name="warning-outline" size={24} color="#dc3545" />
          <Text style={[styles.statLabel, { color: '#dc3545', marginTop: 8 }]}>{error}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.quickStats}>
      <View style={styles.statCard}>
        <View style={[styles.statIconContainer, { backgroundColor: 'rgba(0, 123, 255, 0.1)' }]}> 
          <Ionicons name="people" size={24} color="#007bff" />
        </View>
        <Text style={styles.statNumber}>{counts.users}</Text>
        <Text style={styles.statLabel}>Người dùng</Text>
      </View>
      <View style={styles.statCard}>
        <View style={[styles.statIconContainer, { backgroundColor: 'rgba(40, 167, 69, 0.1)' }]}> 
          <Ionicons name="document-text" size={24} color="#28a745" />
        </View>
        <Text style={styles.statNumber}>{counts.problems}</Text>
        <Text style={styles.statLabel}>Bài tập</Text>
      </View>
      <View style={styles.statCard}>
        <View style={[styles.statIconContainer, { backgroundColor: 'rgba(253, 126, 20, 0.1)' }]}> 
          <Ionicons name="trophy" size={24} color="#fd7e14" />
        </View>
        <Text style={styles.statNumber}>{counts.contests}</Text>
        <Text style={styles.statLabel}>Cuộc thi</Text>
      </View>
    </View>
  );
}

export default function AdminDashboard() {
  const router = useRouter();

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

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        {/* Header với gradient */}
        <LinearGradient
          colors={['#007bff', '#0056b3']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View style={styles.userInfo}>
              <View style={styles.avatarContainer}>
                <Image
                  source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }}
                  style={styles.avatar}
                />
                <View style={styles.statusDot} />
              </View>
              <View style={styles.userText}>
                <Text style={styles.welcomeText}>Xin chào,</Text>
                <Text style={styles.adminName}>Administrator</Text>
              </View>
            </View>
            
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity style={styles.profileButton} onPress={() => router.push('/(tabs)/admin/profile')}>
                <Ionicons name="person-circle-outline" size={28} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={28} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
          
          <Text style={styles.title}>Bảng điều khiển quản trị</Text>
          <Text style={styles.subtitle}>Quản lý toàn bộ hệ thống từ đây</Text>
        </LinearGradient>

        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Thống kê nhanh */}
          <QuickStats />

          {/* Các chức năng chính */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Chức năng quản trị</Text>
            </View>
            
            <View style={styles.featuresGrid}>
              {adminFeatures.map((feature) => (
                <TouchableOpacity
                  key={feature.route}
                  style={styles.featureCard}
                  onPress={() => router.push(feature.route)}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={[`${feature.color}15`, `${feature.color}08`]}
                    style={[styles.featureGradient, { borderLeftColor: feature.color }]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <View style={[styles.featureIconContainer, { backgroundColor: `${feature.color}15` }]}>
                      <Ionicons name={feature.icon} size={28} color={feature.color} />
                    </View>
                    
                    <View style={styles.featureContent}>
                      <Text style={styles.featureTitle}>{feature.label}</Text>
                      <Text style={styles.featureDescription}>{feature.description}</Text>
                    </View>
                    
                    <Ionicons name="chevron-forward" size={20} color="#999" />
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Hoạt động gần đây */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Hoạt động gần đây</Text>
              <TouchableOpacity>
                <Text style={styles.viewAllText}>Xem tất cả</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.activityList}>
              {[
                { user: 'Nguyễn Văn A', action: 'đã nộp bài', target: 'Bài tập 1', time: '5 phút trước' },
                { user: 'Trần Thị B', action: 'đã đăng ký', target: 'Cuộc thi AI', time: '1 giờ trước' },
                { user: 'Lê Văn C', action: 'được thêm vào', target: 'Lớp CNTT', time: '2 giờ trước' },
                { user: 'Phạm Thị D', action: 'cập nhật thông tin', target: 'hồ sơ', time: '3 giờ trước' },
              ].map((activity, index) => (
                <View key={index} style={styles.activityItem}>
                  <View style={styles.activityIcon}>
                    <Ionicons name="time-outline" size={18} color="#666" />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityText}>
                      <Text style={styles.activityUser}>{activity.user}</Text> {activity.action}{' '}
                      <Text style={styles.activityTarget}>{activity.target}</Text>
                    </Text>
                    <Text style={styles.activityTime}>{activity.time}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: StatusBar.currentHeight || 40,
    paddingBottom: 30,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#007bff',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  headerContent: {
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
    marginRight: 15,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: '#fff',
  },
  statusDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
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
  adminName: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 2,
  },
  notificationButton: {
    padding: 10,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#dc3545',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0056b3',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  statIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  viewAllText: {
    color: '#007bff',
    fontSize: 14,
    fontWeight: '500',
  },
  featuresGrid: {
    gap: 15,
  },
  featureCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  featureGradient: {
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
  featureIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  activityList: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  activityUser: {
    fontWeight: '600',
    color: '#333',
  },
  activityTarget: {
    fontWeight: '600',
    color: '#007bff',
  },
  activityTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
});