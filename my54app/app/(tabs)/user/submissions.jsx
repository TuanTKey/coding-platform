
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const BASE_URL = 'http://10.125.204.93:5000';

export default function MySubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchSubmissions = async () => {
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          router.replace('/login');
          return;
        }
        const res = await fetch(`${BASE_URL}/api/submissions/my`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Không thể lấy danh sách bài nộp');
        const data = await res.json();
        setSubmissions(data.submissions || []);
      } catch (err) {
        setSubmissions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, []);

  const goToSubmissionDetail = (submissionId) => {
    // Điều hướng sang trang chi tiết bài nộp (nếu có trang này)
    // router.push(`/user/submissions/${submissionId}`);
    // Hiện tại chỉ alert thông tin
    const sub = submissions.find(s => s._id === submissionId);
    Alert.alert(
      'Chi tiết bài nộp',
      `Bài: ${sub.problemTitle || 'Bài tập'}\nTrạng thái: ${sub.status === 'accepted' ? 'Đúng' : 'Sai'}\nĐiểm: ${sub.score ?? 'Chưa chấm'}\nNộp lúc: ${new Date(sub.createdAt).toLocaleString('vi-VN')}`
    );
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => goToSubmissionDetail(item._id)}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Ionicons name="document-text-outline" size={22} color="#007bff" style={{ marginRight: 10 }} />
        <View style={{ flex: 1 }}>
          <Text style={styles.problemTitle}>{item.problemId?.title || item.problemTitle || 'Bài tập'}</Text>
          <Text style={styles.timeText}>Nộp lúc: {new Date(item.createdAt).toLocaleString('vi-VN')}</Text>
        </View>
        {item.score !== undefined && item.score !== null ? (
          <View style={styles.scoreBox}>
            <Ionicons name="star" size={16} color="#fd7e14" />
            <Text style={styles.scoreText}>{item.score}</Text>
          </View>
        ) : (
          <Text style={styles.pendingText}>Chưa chấm</Text>
        )}
      </View>
      <Text style={styles.statusText}>Trạng thái: <Text style={{ color: item.status === 'accepted' ? '#28a745' : '#dc3545' }}>{item.status === 'accepted' ? 'Đúng' : 'Sai'}</Text></Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <Text style={styles.title}>Bài nộp của tôi</Text>
      {loading ? (
        <View style={styles.centered}><ActivityIndicator size="large" color="#007bff" /><Text style={{marginTop:8}}>Đang tải bài nộp...</Text></View>
      ) : submissions.length === 0 ? (
        <Text style={styles.emptyText}>Bạn chưa có bài nộp nào hoặc giáo viên chưa trả kết quả. Hãy thử nộp bài hoặc đợi giáo viên chấm!</Text>
      ) : (
        <FlatList
          data={submissions}
          keyExtractor={item => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8f9fa', padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#007bff', marginBottom: 16, textAlign: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  problemTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  timeText: { fontSize: 13, color: '#888', marginTop: 2 },
  statusText: { fontSize: 14, color: '#555', marginTop: 8 },
  scoreBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff3cd', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, marginLeft: 8 },
  scoreText: { color: '#fd7e14', fontWeight: 'bold', marginLeft: 4 },
  pendingText: { color: '#888', fontSize: 13, fontStyle: 'italic', marginLeft: 8 },
  emptyText: { textAlign: 'center', color: '#888', marginTop: 32, fontSize: 15 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
