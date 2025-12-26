
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getProblems } from '../../services/adminProblemService';

export default function AdminProblems() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProblems = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) throw new Error('Không tìm thấy token, vui lòng đăng nhập lại.');
        const data = await getProblems(token);
        setProblems(data);
      } catch (err) {
        setError(err.message || 'Lỗi khi tải danh sách bài tập');
        setProblems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProblems();
  }, []);

  const handleAdd = () => {
    // TODO: Hiện modal thêm problem
    alert('Thêm bài tập (chưa làm)');
  };
  const handleEdit = (problem) => {
    // TODO: Hiện modal sửa problem
    alert('Sửa bài tập: ' + problem.title);
  };
  const handleDelete = (problem) => {
    // TODO: Xác nhận xóa problem
    alert('Xóa bài tập: ' + problem.title);
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 12 }}>Quản lý bài tập</Text>
      <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>+ Thêm bài tập</Text>
      </TouchableOpacity>
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 32 }} />
      ) : error ? (
        <Text style={{ color: 'red', marginTop: 32 }}>{error}</Text>
      ) : (
        <FlatList
          data={problems}
          keyExtractor={item => item._id}
          renderItem={({ item }) => (
            <View style={styles.problemRow}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: 'bold' }}>{item.title}</Text>
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
  problemRow: {
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
