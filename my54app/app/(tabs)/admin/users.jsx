import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Alert,
  StatusBar,
  Modal,
  ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://10.125.204.93:5000/api';

const getUsers = async (token) => {
  const res = await fetch(`${BASE_URL}/users`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Lỗi lấy danh sách người dùng');
  return await res.json();
};

const createUser = async (token, userData) => {
  const res = await fetch(`${BASE_URL}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(userData)
  });
  if (!res.ok) throw new Error('Lỗi tạo người dùng');
  return await res.json();
};

const updateUser = async (token, id, userData) => {
  const res = await fetch(`${BASE_URL}/users/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(userData)
  });
  if (!res.ok) throw new Error('Lỗi cập nhật người dùng');
  return await res.json();
};

const deleteUser = async (token, id) => {
  const res = await fetch(`${BASE_URL}/users/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Lỗi xóa người dùng');
  return await res.json();
};

// Đơn giản hóa vai trò
const roles = [
  { value: 'user', label: 'Sinh viên', color: '#007bff' },
  { value: 'teacher', label: 'Giáo viên', color: '#fd7e14' },
  { value: 'admin', label: 'Quản trị', color: '#dc3545' },
];

const statusOptions = [
  { value: 'active', label: 'Hoạt động', color: '#28a745' },
  { value: 'inactive', label: 'Không hoạt động', color: '#6c757d' },
];

export default function UserManagementScreen() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    fullName: '',
    password: '',
    role: 'user',
    class: '',
    studentId: '',
    status: 'active',
  });
  const [formErrors, setFormErrors] = useState({});

  const loadUsers = async () => {
    setError(null);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Lỗi', 'Vui lòng đăng nhập lại');
        router.replace('/login');
        return;
      }

      const data = await getUsers(token);
      setUsers(Array.isArray(data.users) ? data.users : []);
      setFilteredUsers(Array.isArray(data.users) ? data.users : []);
    } catch (err) {
      setError(err.message || 'Lỗi khi tải danh sách người dùng');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Filter users
  useEffect(() => {
    let result = users;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(user =>
        (user.username?.toLowerCase().includes(query) || false) ||
        (user.email?.toLowerCase().includes(query) || false) ||
        (user.fullName?.toLowerCase().includes(query) || false) ||
        (user.studentId?.toLowerCase().includes(query) || false)
      );
    }

    if (selectedRole !== 'all') {
      result = result.filter(user => user.role === selectedRole);
    }

    setFilteredUsers(result);
  }, [users, searchQuery, selectedRole]);

  const onRefresh = () => {
    setRefreshing(true);
    loadUsers();
  };

  const openAddModal = () => {
    setModalMode('add');
    setFormData({
      username: '',
      email: '',
      fullName: '',
      password: '',
      role: 'user',
      class: '',
      studentId: '',
      status: 'active',
    });
    setFormErrors({});
    setCurrentUser(null);
    setShowModal(true);
  };

  const openEditModal = (user) => {
    setModalMode('edit');
    setFormData({
      username: user.username || '',
      email: user.email || '',
      fullName: user.fullName || '',
      password: '',
      role: user.role || 'user',
      class: user.class || '',
      studentId: user.studentId || '',
      status: user.status || 'active',
    });
    setFormErrors({});
    setCurrentUser(user);
    setShowModal(true);
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.username.trim()) {
      errors.username = 'Vui lòng nhập tên đăng nhập';
    }

    if (!formData.email.trim()) {
      errors.email = 'Vui lòng nhập email';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email không hợp lệ';
    }

    if (!formData.fullName.trim()) {
      errors.fullName = 'Vui lòng nhập họ tên';
    }

    if (modalMode === 'add' && !formData.password) {
      errors.password = 'Vui lòng nhập mật khẩu';
    } else if (modalMode === 'add' && formData.password.length < 6) {
      errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const token = await AsyncStorage.getItem('token');
      let result;

      if (modalMode === 'add') {
        result = await createUser(token, formData);
        if (result.success) {
          Alert.alert('Thành công', 'Thêm người dùng thành công');
          loadUsers();
          setShowModal(false);
        }
      } else {
        result = await updateUser(token, currentUser._id, formData);
        if (result.success) {
          Alert.alert('Thành công', 'Cập nhật người dùng thành công');
          loadUsers();
          setShowModal(false);
        }
      }
    } catch (error) {
      Alert.alert('Lỗi', error.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = (user) => {
    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc muốn xóa người dùng "${user.username}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              const result = await deleteUser(token, user._id);
              if (result.success) {
                Alert.alert('Thành công', 'Xóa người dùng thành công');
                loadUsers();
              }
            } catch (error) {
              Alert.alert('Lỗi', error.message || 'Có lỗi xảy ra');
            }
          },
        },
      ]
    );
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const renderUserItem = ({ item }) => (
    <View style={styles.userCard}>
      <View style={styles.userHeader}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {item.fullName?.charAt(0)?.toUpperCase() || 'U'}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.userName}>{item.fullName || 'Chưa có tên'}</Text>
            <View style={[
              styles.roleBadge,
              { backgroundColor: roles.find(r => r.value === item.role)?.color || '#007bff' }
            ]}>
              <Text style={styles.roleText}>
                {roles.find(r => r.value === item.role)?.label || item.role}
              </Text>
            </View>
          </View>
          <Text style={styles.userUsername}>@{item.username}</Text>
          <Text style={styles.userEmail}>{item.email}</Text>
        </View>
      </View>

      <View style={styles.userDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="school-outline" size={14} color="#666" />
          <Text style={styles.detailText}>{item.class || 'Chưa cập nhật'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="id-card-outline" size={14} color="#666" />
          <Text style={styles.detailText}>{item.studentId || 'Chưa có MSSV'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={14} color="#666" />
          <Text style={styles.detailText}>
            {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Chưa cập nhật'}
          </Text>
        </View>
      </View>

      <View style={styles.userFooter}>
        <View style={[
          styles.statusBadge,
          { backgroundColor: statusOptions.find(s => s.value === item.status)?.color || '#6c757d' }
        ]}>
          <Text style={styles.statusText}>
            {statusOptions.find(s => s.value === item.status)?.label || item.status}
          </Text>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => openEditModal(item)}
          >
            <Ionicons name="create-outline" size={16} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDelete(item)}
          >
            <Ionicons name="trash-outline" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Đang tải danh sách người dùng...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadUsers}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const userStats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    admins: users.filter(u => u.role === 'admin').length,
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header nhỏ gọn */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Quản lý người dùng</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={openAddModal}
          >
            <Ionicons name="person-add" size={24} color="#007bff" />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.subtitle}>{userStats.total} người dùng</Text>

        {/* Thống kê nhỏ */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{userStats.total}</Text>
            <Text style={styles.statLabel}>Tổng số</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{userStats.active}</Text>
            <Text style={styles.statLabel}>Hoạt động</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{userStats.admins}</Text>
            <Text style={styles.statLabel}>Quản trị</Text>
          </View>
        </View>

        {/* Search Bar nhỏ */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search-outline" size={18} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm người dùng..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color="#666" />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </View>

      {/* Bộ lọc đơn giản */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContainer}
      >
        <TouchableOpacity
          style={[styles.filterButton, selectedRole === 'all' && styles.filterButtonActive]}
          onPress={() => setSelectedRole('all')}
        >
          <Text style={[styles.filterText, selectedRole === 'all' && styles.filterTextActive]}>
            Tất cả
          </Text>
        </TouchableOpacity>
        {roles.map(role => (
          <TouchableOpacity
            key={role.value}
            style={[
              styles.filterButton,
              selectedRole === role.value && styles.filterButtonActive,
              { borderLeftColor: role.color }
            ]}
            onPress={() => setSelectedRole(role.value)}
          >
            <Text style={[styles.filterText, selectedRole === role.value && styles.filterTextActive]}>
              {role.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* User List */}
      <FlatList
        data={filteredUsers}
        renderItem={renderUserItem}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>Không tìm thấy người dùng nào</Text>
          </View>
        }
      />

      {/* Add/Edit Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {modalMode === 'add' ? 'Thêm người dùng mới' : 'Chỉnh sửa người dùng'}
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Tên đăng nhập *</Text>
                <TextInput
                  style={[styles.formInput, formErrors.username && styles.inputError]}
                  value={formData.username}
                  onChangeText={(text) => updateFormData('username', text)}
                  placeholder="Nhập tên đăng nhập"
                />
                {formErrors.username ? <Text style={styles.errorText}>{formErrors.username}</Text> : null}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Email *</Text>
                <TextInput
                  style={[styles.formInput, formErrors.email && styles.inputError]}
                  value={formData.email}
                  onChangeText={(text) => updateFormData('email', text)}
                  placeholder="Nhập email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {formErrors.email ? <Text style={styles.errorText}>{formErrors.email}</Text> : null}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Họ và tên *</Text>
                <TextInput
                  style={[styles.formInput, formErrors.fullName && styles.inputError]}
                  value={formData.fullName}
                  onChangeText={(text) => updateFormData('fullName', text)}
                  placeholder="Nhập họ tên đầy đủ"
                />
                {formErrors.fullName ? <Text style={styles.errorText}>{formErrors.fullName}</Text> : null}
              </View>

              {modalMode === 'add' && (
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Mật khẩu *</Text>
                  <TextInput
                    style={[styles.formInput, formErrors.password && styles.inputError]}
                    value={formData.password}
                    onChangeText={(text) => updateFormData('password', text)}
                    placeholder="Nhập mật khẩu"
                    secureTextEntry
                  />
                  {formErrors.password ? <Text style={styles.errorText}>{formErrors.password}</Text> : null}
                </View>
              )}

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Lớp</Text>
                <TextInput
                  style={styles.formInput}
                  value={formData.class}
                  onChangeText={(text) => updateFormData('class', text)}
                  placeholder="Nhập lớp"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Mã số sinh viên</Text>
                <TextInput
                  style={styles.formInput}
                  value={formData.studentId}
                  onChangeText={(text) => updateFormData('studentId', text)}
                  placeholder="Nhập mã số sinh viên"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Vai trò</Text>
                <View style={styles.radioGroup}>
                  {roles.map(role => (
                    <TouchableOpacity
                      key={role.value}
                      style={[
                        styles.radioButton,
                        formData.role === role.value && styles.radioButtonActive,
                        { borderColor: role.color }
                      ]}
                      onPress={() => updateFormData('role', role.value)}
                    >
                      <View style={[
                        styles.radioCircle,
                        formData.role === role.value && { backgroundColor: role.color }
                      ]} />
                      <Text style={styles.radioLabel}>{role.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Trạng thái</Text>
                <View style={styles.radioGroup}>
                  {statusOptions.map(status => (
                    <TouchableOpacity
                      key={status.value}
                      style={[
                        styles.radioButton,
                        formData.status === status.value && styles.radioButtonActive,
                        { borderColor: status.color }
                      ]}
                      onPress={() => updateFormData('status', status.value)}
                    >
                      <View style={[
                        styles.radioCircle,
                        formData.status === status.value && { backgroundColor: status.color }
                      ]} />
                      <Text style={styles.radioLabel}>{status.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <LinearGradient
                  colors={['#007bff', '#0056b3']}
                  style={styles.submitGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.submitButtonText}>
                    {modalMode === 'add' ? 'Thêm người dùng' : 'Cập nhật người dùng'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
    fontSize: 16,
  },
  errorText: {
    color: '#dc3545',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: StatusBar.currentHeight || 16,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  addButton: {
    padding: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007bff',
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 4,
  },
  searchContainer: {
    marginBottom: 8,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: '#333',
  },
  filterScroll: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  filterButton: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#007bff',
  },
  filterButtonActive: {
    backgroundColor: '#e9f2ff',
  },
  filterText: {
    color: '#666',
    fontSize: 13,
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#007bff',
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginLeft: 8,
  },
  roleText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  userUsername: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
    color: '#007bff',
  },
  userDetails: {
    backgroundColor: '#fafafa',
    borderRadius: 8,
    padding: 8,
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  userFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  editButton: {
    backgroundColor: '#28a745',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalForm: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 14,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  formInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  inputError: {
    borderColor: '#dc3545',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 12,
    marginTop: 4,
  },
  radioGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginRight: 8,
    marginBottom: 8,
  },
  radioButtonActive: {
    backgroundColor: '#f8f9fa',
  },
  radioCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#e9ecef',
    marginRight: 6,
  },
  radioLabel: {
    fontSize: 13,
    color: '#333',
  },
  submitButton: {
    marginTop: 8,
    borderRadius: 10,
    overflow: 'hidden',
  },
  submitGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});