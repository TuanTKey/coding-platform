
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUsers } from '../../services/adminUserService';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) throw new Error('Không tìm thấy token, vui lòng đăng nhập lại.');
        const data = await getUsers(token);
        setUsers(data.users || []);
      } catch (err) {
        setError(err.message || 'Lỗi khi tải danh sách người dùng');
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleAdd = () => {
    // TODO: Hiện modal thêm user
    alert('Thêm user (chưa làm)');
  };
  const handleEdit = (user) => {
    // TODO: Hiện modal sửa user
    alert('Sửa user: ' + user.name);
  };
  const handleDelete = (user) => {
    // TODO: Xác nhận xóa user
    alert('Xóa user: ' + user.name);
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 12 }}>Quản lý người dùng</Text>
      <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>+ Thêm người dùng</Text>
      </TouchableOpacity>
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 32 }} />
      ) : error ? (
        <Text style={{ color: 'red', marginTop: 32 }}>{error}</Text>
      ) : (
        <FlatList
          data={users}
          keyExtractor={item => item._id}
          renderItem={({ item }) => (
            <View style={styles.userRow}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: 'bold' }}>{item.name}</Text>
                <Text>{item.email}</Text>
                <Text style={{ color: '#888' }}>{item.role}</Text>
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
  userRow: {
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
