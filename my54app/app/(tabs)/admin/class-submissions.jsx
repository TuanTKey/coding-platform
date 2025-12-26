import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator, SafeAreaView, TouchableOpacity, TextInput, RefreshControl, Alert, StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://10.125.204.93:5000/api';

const getClassSubmissions = async (token, className) => {
  const res = await fetch(`${BASE_URL}/submissions/teacher/class-submissions?class=${className}`,
    { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error('Lỗi lấy danh sách bài nộp của lớp');
  return await res.json();
};

export default function ClassSubmissionsScreen({ route }) {
  const router = useRouter();
  const { className } = route.params || {};
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadSubmissions = async () => {
    setError(null);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Lỗi', 'Vui lòng đăng nhập lại');
        router.replace('/login');
        return;
      }
      const data = await getClassSubmissions(token, className);
      setSubmissions(Array.isArray(data.submissions) ? data.submissions : []);
    } catch (err) {
      setError(err.message || 'Lỗi khi tải danh sách bài nộp');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadSubmissions(); }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadSubmissions();
  };

  const filteredSubmissions = submissions.filter(sub => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      sub.user?.fullName?.toLowerCase().includes(query) ||
      sub.problem?.title?.toLowerCase().includes(query)
    );
  });

  const renderSubmissionItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>Bài: {item.problem?.title}</Text>
      <Text>Người nộp: {item.user?.fullName || item.user?.username}</Text>
      <Text>Thời gian chạy: {item.executionTime ? `${item.executionTime} ms` : 'N/A'}</Text>
      <Text>Thời gian nộp: {item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#fd7e14" />
        <Text>Đang tải danh sách bài nộp...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text>{error}</Text>
        <TouchableOpacity onPress={loadSubmissions}>
          <Text>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bài nộp của lớp {className}</Text>
      </View>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm theo tên hoặc bài tập..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      <FlatList
        data={filteredSubmissions}
        renderItem={renderSubmissionItem}
        keyExtractor={item => item._id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<Text style={styles.emptyText}>Không có bài nộp nào</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', marginLeft: 16 },
  searchContainer: { paddingHorizontal: 16, paddingBottom: 8 },
  searchInput: { backgroundColor: '#f1f3f4', borderRadius: 8, padding: 8, marginTop: 8 },
  card: { backgroundColor: '#f8f9fa', margin: 8, padding: 12, borderRadius: 8 },
  title: { fontWeight: 'bold', fontSize: 16 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { textAlign: 'center', marginTop: 32, color: '#888' },
});
