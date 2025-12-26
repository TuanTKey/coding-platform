import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';

const BASE_URL = 'http://10.125.204.93:5000';

function isContestRunning(contest) {
  if (!contest?.startTime || !contest?.endTime) return false;
  const now = new Date();
  const start = new Date(contest.startTime);
  const end = new Date(contest.endTime);
  return now >= start && now <= end;
}

export default function ContestDetail() {
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { id } = useLocalSearchParams();
  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [problems, setProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const router = useRouter();

  const fetchContest = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        router.replace('/login');
        return;
      }
      // Lấy contest
      const res = await fetch(`${BASE_URL}/api/contests/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Không thể lấy chi tiết cuộc thi');
      const data = await res.json();
      setContest(data.contest || data);
      setProblems(data.contest?.problems || data.problems || []);
      setRegistered(data.registered || false);
      // Lấy danh sách bài đã giải (accepted submission) của user trong contest
      const res2 = await fetch(`${BASE_URL}/api/submissions?contestId=${id}&status=accepted`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res2.ok) {
        const data2 = await res2.json();
        setSolvedProblems(data2.submissions?.map(s => s.problemId) || []);
      } else {
        setSolvedProblems([]);
      }
    } catch (err) {
      Alert.alert('Lỗi', err.message || 'Không thể tải cuộc thi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContest();
  }, [id]);

  const handleRegister = async () => {
    try {
      setRegistering(true);
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/api/contests/${id}/register`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Đăng ký thất bại');
      Alert.alert('Đăng ký thành công', 'Bạn đã đăng ký tham gia cuộc thi!');
      // Gọi lại fetchContest để cập nhật trạng thái registered
      fetchContest();
    } catch (err) {
      Alert.alert('Lỗi', err.message || 'Đăng ký thất bại');
    } finally {
      setRegistering(false);
    }
  };

  const goToProblem = (pid) => {
    // Truyền contestId sang trang bài tập
    router.push({
      pathname: `/user/problems/${pid}`,
      params: { contestId: id },
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#fd7e14" />
        </View>
      </SafeAreaView>
    );
  }

  if (!contest) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <Text>Không tìm thấy cuộc thi.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>{contest.title}</Text>
        <Text style={styles.meta}>Thời gian: {formatTime(contest.startTime)} - {formatTime(contest.endTime)}</Text>
        <Text style={styles.description}>{contest.description}</Text>
        {/* Nếu chưa đăng ký và cuộc thi đang diễn ra thì hiện nút đăng ký */}
        {!registered && isContestRunning(contest) && (
          <TouchableOpacity
            style={styles.registerBtn}
            onPress={handleRegister}
            disabled={registering || registered}
          >
            <Ionicons name="log-in-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
            <Text style={styles.registerText}>{registering ? 'Đang đăng ký...' : 'Đăng ký tham gia'}</Text>
          </TouchableOpacity>
        )}
        {registered && solvedProblems.length > 0 && (
          <TouchableOpacity style={[styles.registerBtn, { backgroundColor: '#007bff', marginBottom: 16 }]} onPress={() => setShowSubmitModal(true)}>
            <Ionicons name="cloud-upload-outline" size={20} color="#fff" style={{ marginRight: 6 }} />
            <Text style={styles.registerText}>Nộp bài thi tổng</Text>
          </TouchableOpacity>
        )}
        {/* Modal xác nhận nộp bài thi tổng */}
        <Modal
          visible={showSubmitModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowSubmitModal(false)}
        >
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 24, width: 320, alignItems: 'center' }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>Xác nhận nộp bài thi?</Text>
              <Text style={{ fontSize: 15, color: '#333', marginBottom: 18, textAlign: 'center' }}>
                Bạn chắc chắn muốn nộp toàn bộ bài làm của mình cho cuộc thi này?
              </Text>
              <View style={{ flexDirection: 'row', gap: 16 }}>
                <TouchableOpacity onPress={() => setShowSubmitModal(false)} style={{ paddingVertical: 10, paddingHorizontal: 18, borderRadius: 8, backgroundColor: '#ccc', marginRight: 8 }}>
                  <Text style={{ color: '#333', fontWeight: 'bold' }}>Huỷ</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {
                  setShowSubmitModal(false);
                  Alert.alert('Nộp bài thi thành công', 'Bài thi của bạn đã được gửi đi chấm!');
                }} style={{ paddingVertical: 10, paddingHorizontal: 18, borderRadius: 8, backgroundColor: '#007bff' }}>
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>Xác nhận nộp</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        <Text style={styles.sectionTitle}>Danh sách bài tập:</Text>
        {problems.length === 0 ? (
          <Text style={styles.emptyText}>Chưa có bài tập nào.</Text>
        ) : (
          problems.map((p) => {
            const solved = solvedProblems.includes(p._id);
            return (
              <TouchableOpacity key={p._id} style={styles.problemCard} onPress={() => goToProblem(p._id)}>
                <Ionicons name="document-text-outline" size={22} color={solved ? '#28a745' : '#007bff'} style={{ marginRight: 10 }} />
                <Text style={[styles.problemTitle, solved && { color: '#28a745' }]}>{p.title}</Text>
                {solved && <Text style={{ color: '#28a745', marginLeft: 8, fontWeight: 'bold' }}>Đã giải</Text>}
                <Ionicons name="chevron-forward" size={18} color="#888" style={{ marginLeft: 8 }} />
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const formatTime = (time) => {
  if (!time) return '';
  const d = new Date(time);
  return d.toLocaleString();
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    padding: 18,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fd7e14',
    marginBottom: 6,
  },
  meta: {
    fontSize: 15,
    color: '#888',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#333',
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#fd7e14',
  },
  registerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fd7e14',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 18,
    justifyContent: 'center',
    marginBottom: 18,
  },
  registerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  problemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginVertical: 6,
    padding: 14,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  problemTitle: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 12,
    fontSize: 15,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
