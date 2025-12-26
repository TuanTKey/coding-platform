import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUsers } from '../../services/adminUserService';
import { getProblems } from '../../services/adminProblemService';
import { getContests } from '../../services/adminContestService';

export default function AdminDashboard() {
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
          users: Array.isArray(users) ? users.length : 0,
          problems: Array.isArray(problems) ? problems.length : 0,
          contests: Array.isArray(contests) ? contests.length : 0
        });
      } catch (err) {
        setError(err.message || 'Lỗi khi tải thống kê');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 32 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 24 }}>Admin Dashboard</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 32 }} />
      ) : error ? (
        <Text style={{ color: 'red', marginTop: 32 }}>{error}</Text>
      ) : (
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{counts.users}</Text>
            <Text style={styles.statLabel}>Người dùng</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{counts.problems}</Text>
            <Text style={styles.statLabel}>Bài tập</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{counts.contests}</Text>
            <Text style={styles.statLabel}>Cuộc thi</Text>
          </View>
        </View>
      )}
      {/* Thêm các widget thống kê, navigation tới các chức năng admin ở đây */}
    </View>
  );
}

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
    gap: 16,
  },
  statBox: {
    backgroundColor: '#f2f2f2',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 28,
    alignItems: 'center',
    marginHorizontal: 8,
    minWidth: 90,
    elevation: 2,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
});
