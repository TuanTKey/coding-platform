import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const BASE_URL = 'http://10.125.204.93:5000'; // Đổi lại cho đúng với backend của bạn

export default function Problems() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        router.replace('/login');
        return;
      }
      const res = await fetch(`${BASE_URL}/api/problems`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Không thể lấy danh sách bài tập');
      const data = await res.json();
      setProblems(data.problems || []);
    } catch (err) {
      Alert.alert('Lỗi', err.message || 'Không thể tải bài tập');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProblems();
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.problemCard}
      onPress={() => router.push(`/user/problems/${item._id}`)}
    >
      <Ionicons name="document-text-outline" size={28} color="#007bff" style={{ marginRight: 12 }} />
      <View style={{ flex: 1 }}>
        <Text style={styles.problemTitle}>{item.title}</Text>
        <Text style={styles.problemMeta}>Độ khó: <Text style={{ color: getDifficultyColor(item.difficulty) }}>{item.difficulty}</Text></Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#888" />
    </TouchableOpacity>
  );

  const getDifficultyColor = (difficulty) => {
    if (difficulty === 'easy') return '#28a745';
    if (difficulty === 'medium') return '#fd7e14';
    if (difficulty === 'hard') return '#dc3545';
    return '#888';
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Ionicons name="book-outline" size={28} color="#28a745" style={{ marginRight: 8 }} />
        <Text style={styles.headerTitle}>Bài tập</Text>
      </View>
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#28a745" />
        </View>
      ) : (
        <FlatList
          data={problems}
          keyExtractor={item => item._id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={styles.emptyText}>Chưa có bài tập nào.</Text>}
        />
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
    color: '#28a745',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  problemCard: {
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
  problemTitle: {
    fontSize: 18,
    color: '#333',
    fontWeight: '500',
    marginBottom: 2,
  },
  problemMeta: {
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
