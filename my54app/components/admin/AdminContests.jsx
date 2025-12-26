
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getContests } from '../../services/adminContestService';

export default function AdminContests() {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContests = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) throw new Error('Không tìm thấy token, vui lòng đăng nhập lại.');
        const data = await getContests(token);
        setContests(data);
      } catch (err) {
        setError(err.message || 'Lỗi khi tải danh sách cuộc thi');
        setContests([]);
      } finally {
        setLoading(false);
      }
    };
    fetchContests();
  }, []);

  const handleAdd = () => {
    // TODO: Hiện modal thêm contest
    alert('Thêm cuộc thi (chưa làm)');
  };
  const handleEdit = (contest) => {
    // TODO: Hiện modal sửa contest
    alert('Sửa cuộc thi: ' + contest.name);
  };
  const handleDelete = (contest) => {
    // TODO: Xác nhận xóa contest
    alert('Xóa cuộc thi: ' + contest.name);
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 12 }}>Quản lý cuộc thi</Text>
      <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>+ Thêm cuộc thi</Text>
      </TouchableOpacity>
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 32 }} />
      ) : error ? (
        <Text style={{ color: 'red', marginTop: 32 }}>{error}</Text>
      ) : (
        <FlatList
          data={contests}
          keyExtractor={item => item._id}
          renderItem={({ item }) => (
            <View style={styles.contestRow}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: 'bold' }}>{item.name}</Text>
                <Text>{item.description}</Text>
                <Text style={{ color: '#888' }}>ID: {item._id}</Text>
              </View>
              <TouchableOpacity style={styles.editBtn} onPress={() => handleEdit(item)}>
                <Text style={{ color: '#fff' }}>Sửa</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item)}>
                <Text style={{ color: '#fff' }}>Xóa</Text>
              </TouchableOpacity>
            </View>
          )}
          style={{ marginTop: 16 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  addBtn: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 10,
    width: 180,
    alignSelf: 'flex-end',
  },
  contestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  editBtn: {
    backgroundColor: '#28a745',
    padding: 8,
    borderRadius: 6,
    marginLeft: 8,
  },
  deleteBtn: {
    backgroundColor: '#dc3545',
    padding: 8,
    borderRadius: 6,
    marginLeft: 8,
  },
});
