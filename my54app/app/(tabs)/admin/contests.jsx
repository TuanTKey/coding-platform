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
  ScrollView,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

const BASE_URL = 'http://10.125.204.93:5000/api';

const getContests = async (token) => {
  const res = await fetch(`${BASE_URL}/contests`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Lỗi lấy danh sách cuộc thi');
  return await res.json();
};

const createContest = async (token, contestData) => {
  const res = await fetch(`${BASE_URL}/contests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(contestData)
  });
  if (!res.ok) throw new Error('Lỗi tạo cuộc thi');
  return await res.json();
};

const updateContest = async (token, id, contestData) => {
  const res = await fetch(`${BASE_URL}/contests/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(contestData)
  });
  if (!res.ok) throw new Error('Lỗi cập nhật cuộc thi');
  return await res.json();
};

const deleteContest = async (token, id) => {
  const res = await fetch(`${BASE_URL}/contests/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Lỗi xóa cuộc thi');
  return await res.json();
};

const contestStatus = [
  { value: 'upcoming', label: 'Sắp diễn ra', color: '#007bff' },
  { value: 'ongoing', label: 'Đang diễn ra', color: '#28a745' },
  { value: 'ended', label: 'Đã kết thúc', color: '#6c757d' },
  { value: 'draft', label: 'Bản nháp', color: '#fd7e14' },
];

export default function ContestManagementScreen() {
  const router = useRouter();
  const [contests, setContests] = useState([]);
  const [filteredContests, setFilteredContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [currentContest, setCurrentContest] = useState(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState(null); // 'start' | 'end' | null
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  // Add form state and error state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: new Date(),
    endTime: new Date(),
    duration: 120,
    maxParticipants: 100,
    registrationDeadline: new Date(),
    status: 'upcoming',
    rules: '',
    prizes: '',
    problems: [],
  });
  const [formErrors, setFormErrors] = useState({});

  // Hàm show picker
  const showPicker = (mode) => {
    setPickerMode(mode);
    setDatePickerVisibility(true);
  };
  const hidePicker = () => {
    setDatePickerVisibility(false);
  };
  const handleConfirm = (date) => {
    if (pickerMode === 'start') updateFormData('startTime', date);
    if (pickerMode === 'end') updateFormData('endTime', date);
    hidePicker();
  };

  const loadContests = async () => {
    setError(null);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Lỗi', 'Vui lòng đăng nhập lại');
        router.replace('/login');
        return;
      }

      const data = await getContests(token);
      setContests(Array.isArray(data.contests) ? data.contests : []);
      setFilteredContests(Array.isArray(data.contests) ? data.contests : []);
    } catch (err) {
      setError(err.message || 'Lỗi khi tải danh sách cuộc thi');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadContests();
  }, []);

  // Filter contests
  useEffect(() => {
    let result = contests;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(contest =>
        (contest.title?.toLowerCase().includes(query) || false) ||
        (contest.description?.toLowerCase().includes(query) || false)
      );
    }

    if (selectedStatus !== 'all') {
      result = result.filter(contest => contest.status === selectedStatus);
    }

    setFilteredContests(result);
  }, [contests, searchQuery, selectedStatus]);

  const onRefresh = () => {
    setRefreshing(true);
    loadContests();
  };

  const formatDate = (date) => {
    if (!date) return 'Chưa đặt';
    const d = new Date(date);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()} ${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  const openAddModal = () => {
    setModalMode('add');
    const now = new Date();
    setFormData({
      title: '',
      description: '',
      startTime: new Date(now.getTime() + 3600000),
      endTime: new Date(now.getTime() + 7200000),
      duration: 120,
      maxParticipants: 100,
      registrationDeadline: new Date(now.getTime() + 1800000),
      status: 'upcoming',
      rules: '',
      prizes: '',
      problems: [],
    });
    setFormErrors({});
    setCurrentContest(null);
    setShowModal(true);
  };

  const openEditModal = (contest) => {
    setModalMode('edit');
    setFormData({
      title: contest.title || '',
      description: contest.description || '',
      startTime: contest.startTime ? new Date(contest.startTime) : new Date(),
      endTime: contest.endTime ? new Date(contest.endTime) : new Date(),
      duration: contest.duration || 120,
      maxParticipants: contest.maxParticipants || 100,
      registrationDeadline: contest.registrationDeadline ? new Date(contest.registrationDeadline) : new Date(),
      status: contest.status || 'upcoming',
      rules: contest.rules || '',
      prizes: contest.prizes || '',
      problems: Array.isArray(contest.problems) ? contest.problems : [],
    });
    setFormErrors({});
    setCurrentContest(contest);
    setShowModal(true);
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.title.trim()) {
      errors.title = 'Vui lòng nhập tiêu đề cuộc thi';
    }

    if (!formData.description.trim()) {
      errors.description = 'Vui lòng nhập mô tả cuộc thi';
    }

    if (formData.startTime >= formData.endTime) {
      errors.endTime = 'Thời gian kết thúc phải sau thời gian bắt đầu';
    }

    if (formData.duration <= 0) {
      errors.duration = 'Thời lượng phải lớn hơn 0';
    }

    if (formData.maxParticipants <= 0) {
      errors.maxParticipants = 'Số lượng người tham gia phải lớn hơn 0';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const token = await AsyncStorage.getItem('token');
      let result;

      const submitData = {
        ...formData,
        startTime: formData.startTime.toISOString(),
        endTime: formData.endTime.toISOString(),
        registrationDeadline: formData.registrationDeadline.toISOString(),
      };

      if (modalMode === 'add') {
        result = await createContest(token, submitData);
        if (result.success) {
          Alert.alert('Thành công', 'Tạo cuộc thi thành công');
          loadContests();
          setShowModal(false);
        }
      } else {
        result = await updateContest(token, currentContest._id, submitData);
        if (result.success) {
          Alert.alert('Thành công', 'Cập nhật cuộc thi thành công');
          loadContests();
          setShowModal(false);
        }
      }
    } catch (error) {
      Alert.alert('Lỗi', error.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = (contest) => {
    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc muốn xóa cuộc thi "${contest.title}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              const result = await deleteContest(token, contest._id);
              if (result.success) {
                Alert.alert('Thành công', 'Xóa cuộc thi thành công');
                loadContests();
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

  const getContestStatus = (startTime, endTime) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (now < start) return 'upcoming';
    if (now >= start && now <= end) return 'ongoing';
    return 'ended';
  };

  const renderContestItem = ({ item }) => {
    const status = getContestStatus(item.startTime, item.endTime);
    const statusInfo = contestStatus.find(s => s.value === status) || contestStatus[0];

    return (
      <TouchableOpacity
        style={styles.contestCard}
        onPress={() => openEditModal(item)}
        activeOpacity={0.9}
      >
        <View style={styles.contestHeader}>
          <View style={styles.contestTitleRow}>
            <Text style={styles.contestTitle} numberOfLines={1}>{item.title}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
              <Text style={styles.statusText}>{statusInfo.label}</Text>
            </View>
          </View>
          <Text style={styles.contestDesc} numberOfLines={2}>
            {item.description}
          </Text>
        </View>

        <View style={styles.contestDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={14} color="#666" />
            <Text style={styles.detailText}>
              Bắt đầu: {formatDate(item.startTime)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="hourglass-outline" size={14} color="#666" />
            <Text style={styles.detailText}>
              Kết thúc: {formatDate(item.endTime)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="people-outline" size={14} color="#666" />
            <Text style={styles.detailText}>
              Thời lượng: {item.duration} phút
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="trophy-outline" size={14} color="#666" />
            <Text style={styles.detailText}>
              Số bài: {Array.isArray(item.problems) ? item.problems.length : 0} bài
            </Text>
          </View>
        </View>

        <View style={styles.contestFooter}>
          <View style={styles.participantInfo}>
            <Ionicons name="person" size={12} color="#666" />
            <Text style={styles.participantText}>
              {item.participantsCount || 0}/{item.maxParticipants || 100}
            </Text>
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
        <ActivityIndicator size="large" color="#fd7e14" />
        <Text style={styles.loadingText}>Đang tải danh sách cuộc thi...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadContests}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const contestStats = {
    total: contests.length,
    upcoming: contests.filter(c => getContestStatus(c.startTime, c.endTime) === 'upcoming').length,
    ongoing: contests.filter(c => getContestStatus(c.startTime, c.endTime) === 'ongoing').length,
    ended: contests.filter(c => getContestStatus(c.startTime, c.endTime) === 'ended').length,
  };

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
          <Text style={styles.title}>Quản lý cuộc thi</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={openAddModal}
          >
            <Ionicons name="add-circle" size={24} color="#fd7e14" />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.subtitle}>{contestStats.total} cuộc thi</Text>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{contestStats.total}</Text>
            <Text style={styles.statLabel}>Tổng số</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#007bff' }]}>{contestStats.upcoming}</Text>
            <Text style={styles.statLabel}>Sắp diễn ra</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#28a745' }]}>{contestStats.ongoing}</Text>
            <Text style={styles.statLabel}>Đang diễn ra</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#6c757d' }]}>{contestStats.ended}</Text>
            <Text style={styles.statLabel}>Đã kết thúc</Text>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search-outline" size={18} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm cuộc thi..."
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

      {/* Filters */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContainer}
      >
        <TouchableOpacity
          style={[styles.filterButton, selectedStatus === 'all' && styles.filterButtonActive]}
          onPress={() => setSelectedStatus('all')}
        >
          <Text style={[styles.filterText, selectedStatus === 'all' && styles.filterTextActive]}>
            Tất cả
          </Text>
        </TouchableOpacity>
        {contestStatus.map(status => (
          <TouchableOpacity
            key={status.value}
            style={[
              styles.filterButton,
              selectedStatus === status.value && styles.filterButtonActive,
              { borderLeftColor: status.color }
            ]}
            onPress={() => setSelectedStatus(status.value)}
          >
            <Text style={[styles.filterText, selectedStatus === status.value && styles.filterTextActive]}>
              {status.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Contest List */}
      <FlatList
        data={filteredContests}
        renderItem={renderContestItem}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="trophy-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>Không tìm thấy cuộc thi nào</Text>
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
                {modalMode === 'add' ? 'Tạo cuộc thi mới' : 'Chỉnh sửa cuộc thi'}
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Tiêu đề *</Text>
                <TextInput
                  style={[styles.formInput, formErrors.title && styles.inputError]}
                  value={formData.title}
                  onChangeText={(text) => updateFormData('title', text)}
                  placeholder="Nhập tiêu đề cuộc thi"
                />
                {formErrors.title ? <Text style={styles.errorText}>{formErrors.title}</Text> : null}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Mô tả *</Text>
                <TextInput
                  style={[styles.formTextArea, formErrors.description && styles.inputError]}
                  value={formData.description}
                  onChangeText={(text) => updateFormData('description', text)}
                  placeholder="Nhập mô tả cuộc thi"
                  multiline
                  numberOfLines={3}
                />
                {formErrors.description ? <Text style={styles.errorText}>{formErrors.description}</Text> : null}
              </View>

              <View style={styles.formRow}>
                <View style={styles.formHalf}>
                  <Text style={styles.formLabel}>Thời gian bắt đầu</Text>
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => showPicker('start')}
                  >
                    <Ionicons name="calendar-outline" size={18} color="#666" style={{ marginRight: 8 }} />
                    <Text style={styles.dateText}>{formatDate(formData.startTime)}</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.formHalf}>
                  <Text style={styles.formLabel}>Thời gian kết thúc</Text>
                  <TouchableOpacity
                    style={[styles.dateButton, formErrors.endTime && styles.inputError]}
                    onPress={() => showPicker('end')}
                  >
                    <Ionicons name="calendar-outline" size={18} color="#666" style={{ marginRight: 8 }} />
                    <Text style={styles.dateText}>{formatDate(formData.endTime)}</Text>
                  </TouchableOpacity>
                  {formErrors.endTime ? <Text style={styles.errorText}>{formErrors.endTime}</Text> : null}
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={styles.formHalf}>
                  <Text style={styles.formLabel}>Thời lượng (phút) *</Text>
                  <TextInput
                    style={[styles.formInput, formErrors.duration && styles.inputError]}
                    value={formData.duration.toString()}
                    onChangeText={(text) => updateFormData('duration', parseInt(text) || 120)}
                    placeholder="Thời lượng"
                    keyboardType="numeric"
                  />
                  {formErrors.duration ? <Text style={styles.errorText}>{formErrors.duration}</Text> : null}
                </View>
                <View style={styles.formHalf}>
                  <Text style={styles.formLabel}>Số người tham gia tối đa *</Text>
                  <TextInput
                    style={[styles.formInput, formErrors.maxParticipants && styles.inputError]}
                    value={formData.maxParticipants.toString()}
                    onChangeText={(text) => updateFormData('maxParticipants', parseInt(text) || 100)}
                    placeholder="Số người tham gia"
                    keyboardType="numeric"
                  />
                  {formErrors.maxParticipants ? <Text style={styles.errorText}>{formErrors.maxParticipants}</Text> : null}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Hạn đăng ký</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => {
                    setShowStartPicker(false);
                    setShowEndPicker(false);
                    // You might want to add a separate picker for registration deadline
                  }}
                >
                  <Ionicons name="calendar-outline" size={18} color="#666" style={{ marginRight: 8 }} />
                  <Text style={styles.dateText}>{formatDate(formData.registrationDeadline)}</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Quy định</Text>
                <TextInput
                  style={styles.formTextArea}
                  value={formData.rules}
                  onChangeText={(text) => updateFormData('rules', text)}
                  placeholder="Nhập quy định cuộc thi"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Giải thưởng</Text>
                <TextInput
                  style={styles.formTextArea}
                  value={formData.prizes}
                  onChangeText={(text) => updateFormData('prizes', text)}
                  placeholder="Mô tả giải thưởng"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Trạng thái</Text>
                <View style={styles.radioGroup}>
                  {contestStatus.map(status => (
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
                  colors={['#fd7e14', '#e8590c']}
                  style={styles.submitGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.submitButtonText}>
                    {modalMode === 'add' ? 'Tạo cuộc thi' : 'Cập nhật cuộc thi'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="datetime"
        date={pickerMode === 'start' ? (formData.startTime || new Date()) : (formData.endTime || new Date())}
        minimumDate={pickerMode === 'end' ? (formData.startTime || new Date()) : new Date(2000, 0, 1)}
        onConfirm={handleConfirm}
        onCancel={hidePicker}
      />
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
    backgroundColor: '#fd7e14',
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
    color: '#fd7e14',
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
    borderLeftColor: '#fd7e14',
  },
  filterButtonActive: {
    backgroundColor: '#fff3e6',
  },
  filterText: {
    color: '#666',
    fontSize: 13,
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#fd7e14',
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  contestCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  contestHeader: {
    marginBottom: 12,
  },
  contestTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  contestTitle: {
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
  contestDesc: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  contestDetails: {
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
    marginLeft: 6,
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  contestFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  participantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantText: {
    fontSize: 12,
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
  dateButton: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 15,
    color: '#333',
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