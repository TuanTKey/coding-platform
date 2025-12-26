import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, TextInput, RefreshControl, Alert, StatusBar, Modal, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://10.125.204.93:5000/api';

const getClasses = async (token) => {
  const res = await fetch(`${BASE_URL}/admin/classes`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Lỗi lấy danh sách lớp học');
  return await res.json();
};

const getAllTeachers = async (token) => {
  const res = await fetch(`${BASE_URL}/users?role=teacher`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Lỗi lấy danh sách giáo viên');
  return await res.json();
};

const createClass = async (token, classData) => {
  const res = await fetch(`${BASE_URL}/admin/classes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(classData)
  });
  if (!res.ok) throw new Error('Lỗi tạo lớp học');
  return await res.json();
};

  const updateClass = async (token, className, classData) => {
    const res = await fetch(`${BASE_URL}/admin/classes/${encodeURIComponent(className)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        description: classData.description,
        teacherId: classData.teacherId
      })
    });
    if (!res.ok) throw new Error('Lỗi cập nhật lớp học');
    return await res.json();
  };

const deleteClass = async (token, id) => {
  const res = await fetch(`${BASE_URL}/admin/classes/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Lỗi xóa lớp học');
  return await res.json();
};

const classColors = ['#007bff', '#28a745', '#fd7e14', '#6f42c1', '#20c997', '#dc3545'];

export default function ClassManagementScreen() {
  const router = useRouter();
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [stats, setStats] = useState({});
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [currentClass, setCurrentClass] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    teacherId: '',
    slug: '',
    academicYear: new Date().getFullYear(),
    semester: 1,
    isActive: true,
  });
  const [formErrors, setFormErrors] = useState({});

  const loadClasses = async () => {
    setError(null);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Lỗi', 'Vui lòng đăng nhập lại');
        router.replace('/login');
        return;
      }
      
      // Load classes and teachers in parallel
      const [classesData, teachersData] = await Promise.all([
        getClasses(token),
        getAllTeachers(token)
      ]);
      
      setClasses(Array.isArray(classesData.classes) ? classesData.classes : []);
      setFilteredClasses(Array.isArray(classesData.classes) ? classesData.classes : []);
      setStats(classesData.stats || {});
      setTeachers(Array.isArray(teachersData.users) ? teachersData.users : []);
    } catch (err) {
      setError(err.message || 'Lỗi khi tải danh sách lớp học');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    let result = classes;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(cls => {
        const teacher = teachers.find(t => t._id === cls.teacherId);
        const teacherName = teacher?.fullName || teacher?.username || '';
        return (
          cls.name?.toLowerCase().includes(query) ||
          cls.slug?.toLowerCase().includes(query) ||
          teacherName.toLowerCase().includes(query)
        );
      });
    }

    setFilteredClasses(result);
  }, [classes, searchQuery, teachers]);

  const onRefresh = () => {
    setRefreshing(true);
    loadClasses();
  };

  const openAddModal = () => {
    setModalMode('add');
    setFormData({
      name: '',
      description: '',
      teacherId: '',
      slug: '',
      academicYear: new Date().getFullYear(),
      semester: 1,
      isActive: true,
    });
    setFormErrors({});
    setCurrentClass(null);
    setShowModal(true);
  };

  const openEditModal = (classItem) => {
    setModalMode('edit');
    setFormData({
      name: classItem.name || '',
      description: classItem.description || '',
      teacherId: classItem.teacherId || '',
      slug: classItem.slug || '',
      academicYear: classItem.academicYear || new Date().getFullYear(),
      semester: classItem.semester || 1,
      isActive: classItem.isActive !== undefined ? classItem.isActive : true,
    });
    setFormErrors({});
    setCurrentClass(classItem);
    setShowModal(true);
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Vui lòng nhập tên lớp học';
    }

    if (!formData.slug.trim()) {
      errors.slug = 'Vui lòng nhập mã lớp';
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
        result = await createClass(token, formData);
        if (result.success) {
          Alert.alert('Thành công', 'Tạo lớp học thành công');
          loadClasses();
          setShowModal(false);
        }
      } else {
        // Gửi cả isActive khi cập nhật lớp học
        result = await updateClass(token, currentClass.name, formData);
        if (result.success) {
          Alert.alert('Thành công', 'Cập nhật lớp học thành công');
          loadClasses();
          setShowModal(false);
        }
      }
    } catch (error) {
      Alert.alert('Lỗi', error.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = (classItem) => {
    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc muốn xóa lớp "${classItem.name}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              const result = await deleteClass(token, classItem._id);
              if (result.success) {
                Alert.alert('Thành công', 'Xóa lớp học thành công');
                loadClasses();
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

  const generateSlug = () => {
    const name = formData.name.trim();
    if (!name) return;
    
    // Generate slug from name: remove accents, lowercase, replace spaces with hyphens
    const slug = name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    
    updateFormData('slug', slug);
  };

  const getTeacherName = (teacherId) => {
    const teacher = teachers.find(t => t._id === teacherId);
    return teacher ? teacher.fullName || teacher.username : 'Chưa gán';
  };

  const renderClassItem = ({ item, index }) => {
    const classStat = stats[item.name?.toUpperCase()] || {};
    const teacherName = getTeacherName(item.teacherId);
    const color = classColors[index % classColors.length];

    return (
      <TouchableOpacity
        style={styles.classCard}
        onPress={() => openEditModal(item)}
        activeOpacity={0.9}
      >
        <View style={[styles.classColorBar, { backgroundColor: color }]} />
        <View style={styles.classContent}>
          <View style={styles.classHeader}>
            <View style={styles.classTitleRow}>
              <Text style={styles.className} numberOfLines={1}>{item.name}</Text>

            </View>
            <Text style={styles.classSlug}>Mã lớp: {item.slug}</Text>
          </View>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDelete(item)}
          >
            <Ionicons name="trash-outline" size={18} color="#dc3545" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Đang tải danh sách lớp học...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadClasses}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const classStats = {
    total: classes.length,
    active: classes.filter(c => c.isActive).length,
    withTeacher: classes.filter(c => c.teacherId).length,
  };

  const academicYears = [
    new Date().getFullYear(),
    new Date().getFullYear() - 1,
    new Date().getFullYear() - 2,
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Quản lý lớp học</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={openAddModal}
          >
            <Ionicons name="add-circle" size={24} color="#007bff" />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.subtitle}>{classStats.total} lớp học</Text>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{classStats.total}</Text>
            <Text style={styles.statLabel}>Tổng số</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#fd7e14' }]}>{classStats.withTeacher}</Text>
            <Text style={styles.statLabel}>Có giáo viên</Text>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search-outline" size={18} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm lớp học..."
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

      {/* Class List */}
      <FlatList
        data={filteredClasses}
        renderItem={renderClassItem}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="school-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>Không tìm thấy lớp học nào</Text>
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
                {modalMode === 'add' ? 'Tạo lớp học mới' : 'Chỉnh sửa lớp học'}
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Tên lớp học *</Text>
                <TextInput
                  style={[styles.formInput, formErrors.name && styles.inputError]}
                  value={formData.name}
                  onChangeText={(text) => updateFormData('name', text)}
                  placeholder="Nhập tên lớp học"
                />
                {formErrors.name ? <Text style={styles.errorText}>{formErrors.name}</Text> : null}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Mã lớp *</Text>
                <View style={styles.slugContainer}>
                  <TextInput
                    style={[styles.formInput, formErrors.slug && styles.inputError, { flex: 1 }]}
                    value={formData.slug}
                    onChangeText={(text) => updateFormData('slug', text)}
                    placeholder="VD: cntt-k15"
                  />
                  <TouchableOpacity style={styles.generateButton} onPress={generateSlug}>
                    <Text style={styles.generateButtonText}>Tạo mã</Text>
                  </TouchableOpacity>
                </View>
                {formErrors.slug ? <Text style={styles.errorText}>{formErrors.slug}</Text> : null}
                <Text style={styles.formHint}>Mã lớp dùng để học sinh tham gia lớp</Text>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Mô tả</Text>
                <TextInput
                  style={styles.formTextArea}
                  value={formData.description}
                  onChangeText={(text) => updateFormData('description', text)}
                  placeholder="Nhập mô tả lớp học"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.formRow}>
                <View style={styles.formHalf}>
                  <Text style={styles.formLabel}>Năm học</Text>
                  <View style={styles.pickerContainer}>
                    {academicYears.map(year => (
                      <TouchableOpacity
                        key={year}
                        style={[
                          styles.yearButton,
                          formData.academicYear === year && styles.yearButtonActive
                        ]}
                        onPress={() => updateFormData('academicYear', year)}
                      >
                        <Text style={[
                          styles.yearText,
                          formData.academicYear === year && styles.yearTextActive
                        ]}>
                          {year}-{year + 1}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                <View style={styles.formHalf}>
                  <Text style={styles.formLabel}>Học kỳ</Text>
                  <View style={styles.pickerContainer}>
                    {[1, 2, 3].map(sem => (
                      <TouchableOpacity
                        key={sem}
                        style={[
                          styles.semesterButton,
                          formData.semester === sem && styles.semesterButtonActive
                        ]}
                        onPress={() => updateFormData('semester', sem)}
                      >
                        <Text style={[
                          styles.semesterText,
                          formData.semester === sem && styles.semesterTextActive
                        ]}>
                          HK{sem}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Giáo viên phụ trách</Text>
                <View style={styles.teacherPicker}>
                  <TouchableOpacity
                    style={[
                      styles.teacherOption,
                      !formData.teacherId && styles.teacherOptionActive
                    ]}
                    onPress={() => updateFormData('teacherId', '')}
                  >
                    <Text style={[
                      styles.teacherOptionText,
                      !formData.teacherId && styles.teacherOptionTextActive
                    ]}>
                      Chưa gán
                    </Text>
                  </TouchableOpacity>
                  {teachers.filter(t => t.role === 'teacher').map(teacher => (
                    <TouchableOpacity
                      key={teacher._id}
                      style={[ 
                        styles.teacherOption,
                        formData.teacherId === teacher._id && styles.teacherOptionActive
                      ]}
                      onPress={() => updateFormData('teacherId', teacher._id)}
                    >
                      <Text style={[ 
                        styles.teacherOptionText,
                        formData.teacherId === teacher._id && styles.teacherOptionTextActive
                      ]}>
                        {teacher.fullName || teacher.username}
                      </Text>
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
                    {modalMode === 'add' ? 'Tạo lớp học' : 'Cập nhật lớp học'}
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
    fontSize: 16,
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
  listContent: {
    padding: 16,
  },
  classCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  classColorBar: {
    width: 6,
    backgroundColor: '#007bff',
  },
  classContent: {
    flex: 1,
    padding: 14,
  },
  classHeader: {
    marginBottom: 12,
  },
  classTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  className: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  classSlug: {
    fontSize: 13,
    color: '#666',
  },
  classDetails: {
    backgroundColor: '#fafafa',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
    flex: 1,
  },
  teacherName: {
    fontWeight: '600',
    color: '#007bff',
  },
  studentCount: {
    fontWeight: 'bold',
    color: '#28a745',
  },
  classFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  statText: {
    fontSize: 11,
    color: '#666',
    marginLeft: 4,
  },
  deleteButton: {
    padding: 6,
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
    maxHeight: '90%',
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
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  formHalf: {
    flex: 1,
    marginRight: 8,
  },
  formHalf: {
    flex: 1,
    marginLeft: 8,
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
  formTextArea: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e9ecef',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: '#dc3545',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 12,
    marginTop: 4,
  },
  formHint: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  slugContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  generateButton: {
    backgroundColor: '#6c757d',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 8,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  yearButton: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 4,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  yearButtonActive: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  yearText: {
    fontSize: 13,
    color: '#666',
  },
  yearTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  semesterButton: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 4,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  semesterButtonActive: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  semesterText: {
    fontSize: 13,
    color: '#666',
  },
  semesterTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  teacherPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  teacherOption: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 4,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  teacherOptionActive: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  teacherOptionText: {
    fontSize: 13,
    color: '#666',
  },
  teacherOptionTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  radioGroup: {
    flexDirection: 'row',
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginRight: 12,
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