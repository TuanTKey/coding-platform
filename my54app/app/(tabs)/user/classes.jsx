import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  Alert, 
  RefreshControl,
  TouchableOpacity,
  StatusBar,
  Dimensions 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const BASE_URL = 'http://10.125.204.93:5000';

export default function MyClasses() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        router.replace('/login');
        return;
      }
      const res = await fetch(`${BASE_URL}/api/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Không thể lấy thông tin lớp học');
      const data = await res.json();
      
      // Lấy danh sách lớp từ trường "class" hoặc "classes" của user
      let classList = [];
      if (data.user) {
        if (data.user.class) classList = [data.user.class];
        if (data.user.classes) classList = data.user.classes;
      }
      setClasses(classList.filter(Boolean));
    } catch (err) {
      Alert.alert('Lỗi', err.message || 'Không thể tải lớp học');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchClasses();
  };

  const renderClassCard = ({ item, index }) => {
    // Màu gradient khác nhau cho mỗi card
    const gradients = [
      ['#6366f1', '#8b5cf6'], // Indigo to Purple
      ['#0ea5e9', '#3b82f6'], // Sky to Blue
      ['#10b981', '#059669'], // Emerald to Green
      ['#f59e0b', '#d97706'], // Amber to Orange
    ];
    
    const gradientColors = gradients[index % gradients.length];
    
    return (
      <TouchableOpacity 
        style={styles.classCard}
        activeOpacity={0.9}
        onPress={() => {
          // Navigation đến chi tiết lớp học
          Alert.alert('Thông báo', `Bạn đã chọn lớp ${item}`);
        }}
      >
        <LinearGradient
          colors={gradientColors}
          style={styles.cardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <View style={styles.iconContainer}>
                <Ionicons name="people" size={24} color="#fff" />
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Lớp học</Text>
              </View>
            </View>
            
            <Text style={styles.className}>{item}</Text>
            <Text style={styles.classCode}>Mã lớp: {item}</Text>
            
            <View style={styles.cardFooter}>
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Ionicons name="person-outline" size={16} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.statText}>25 học viên</Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="document-text-outline" size={16} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.statText}>12 bài tập</Text>
                </View>
              </View>
              
              <View style={styles.arrowContainer}>
                <MaterialIcons name="arrow-forward-ios" size={16} color="#fff" />
              </View>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1f2e" />
      
      {/* Header với gradient */}
      <LinearGradient
        colors={['#1a1f2e', '#2d3748']}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <Ionicons name="school" size={28} color="#60a5fa" />
            <Text style={styles.headerTitle}>Lớp học của tôi</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.searchButton}
            onPress={() => Alert.alert('Tìm kiếm', 'Chức năng tìm kiếm lớp học')}
          >
            <Ionicons name="search" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.headerStats}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{classes.length}</Text>
            <Text style={styles.statLabel}>Lớp học</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>5</Text>
            <Text style={styles.statLabel}>Đang hoạt động</Text>
          </View>
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Đang tải lớp học...</Text>
        </View>
      ) : (
        <FlatList
          data={classes}
          keyExtractor={(item, idx) => item + idx}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              colors={['#6366f1']}
              tintColor="#6366f1"
            />
          }
          renderItem={renderClassCard}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <Text style={styles.listTitle}>Tất cả lớp học ({classes.length})</Text>
              {classes.length > 0 && (
                <TouchableOpacity style={styles.filterButton}>
                  <Ionicons name="filter" size={18} color="#6366f1" />
                  <Text style={styles.filterText}>Lọc</Text>
                </TouchableOpacity>
              )}
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="school-outline" size={80} color="#cbd5e1" />
              <Text style={styles.emptyTitle}>Chưa có lớp học</Text>
              <Text style={styles.emptyText}>Bạn chưa tham gia lớp học nào.</Text>
              <TouchableOpacity 
                style={styles.joinButton}
                onPress={() => Alert.alert('Tham gia lớp học', 'Nhập mã lớp học để tham gia')}
              >
                <Text style={styles.joinButtonText}>Tham gia lớp học</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  headerGradient: {
    paddingTop: 10,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 12,
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerStats: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  statCard: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 32,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  filterText: {
    marginLeft: 6,
    color: '#6366f1',
    fontWeight: '600',
    fontSize: 14,
  },
  classCard: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  cardGradient: {
    borderRadius: 20,
  },
  cardContent: {
    padding: 24,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  className: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  classCode: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 24,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  statText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    marginLeft: 6,
    fontWeight: '500',
  },
  arrowContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#475569',
    marginTop: 24,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 24,
  },
  joinButton: {
    marginTop: 32,
    backgroundColor: '#6366f1',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});