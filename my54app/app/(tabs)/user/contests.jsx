import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, RefreshControl, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const BASE_URL = 'http://10.125.204.93:5000'; // Đổi lại cho đúng với backend của bạn

export default function Contests() {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchContests = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        router.replace('/login');
        return;
      }
      const res = await fetch(`${BASE_URL}/api/contests`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Không thể lấy danh sách cuộc thi');
      const data = await res.json();
      setContests(data.contests || data || []);
    } catch (err) {
      Alert.alert('Lỗi', err.message || 'Không thể tải cuộc thi');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchContests();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchContests();
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.contestCard} onPress={() => router.push(`/user/contests/${item._id}`)}>
      <Ionicons name="trophy-outline" size={28} color="#fd7e14" style={{ marginRight: 12 }} />
      <View style={{ flex: 1 }}>
        <Text style={styles.contestTitle}>{item.title}</Text>
        <Text style={styles.contestMeta}>Thời gian: {formatTime(item.startTime)} - {formatTime(item.endTime)}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#888" />
    </TouchableOpacity>
  );

  // Chia contest thành 3 nhóm
  const now = new Date();
  const running = contests.filter(c => new Date(c.startTime) <= now && new Date(c.endTime) >= now);
  const upcoming = contests.filter(c => new Date(c.startTime) > now);
  const ended = contests.filter(c => new Date(c.endTime) < now);

  const formatTime = (time) => {
    if (!time) return '';
    const d = new Date(time);
    return d.toLocaleString();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Ionicons name="trophy-outline" size={28} color="#fd7e14" style={{ marginRight: 8 }} />
        <Text style={styles.headerTitle}>Cuộc thi</Text>
      </View>
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#fd7e14" />
        </View>
      ) : (
        <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
          <Text style={[styles.sectionTitle, { color: '#28a745' }]}>Đang diễn ra</Text>
          {running.length === 0 ? <Text style={styles.emptyText}>Không có cuộc thi nào đang diễn ra.</Text> : running.map(c => (
            <React.Fragment key={c._id}>{renderItem({ item: c })}</React.Fragment>
          ))}
          <Text style={[styles.sectionTitle, { color: '#007bff', marginTop: 18 }]}>Sắp diễn ra</Text>
          {upcoming.length === 0 ? <Text style={styles.emptyText}>Không có cuộc thi sắp diễn ra.</Text> : upcoming.map(c => (
            <React.Fragment key={c._id}>{renderItem({ item: c })}</React.Fragment>
          ))}
          <Text style={[styles.sectionTitle, { color: '#888', marginTop: 18 }]}>Đã kết thúc</Text>
          {ended.length === 0 ? <Text style={styles.emptyText}>Không có cuộc thi đã kết thúc.</Text> : ended.map(c => (
            <React.Fragment key={c._id}>{renderItem({ item: c })}</React.Fragment>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fd7e14',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 18,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  contestTitle: {
    fontSize: 18,
    color: '#333',
    fontWeight: '500',
    marginBottom: 2,
  },
  contestMeta: {
    fontSize: 14,
    color: '#888',
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 32,
    fontSize: 16,
  },
});
