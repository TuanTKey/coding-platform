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

const getProblems = async (token) => {
  const res = await fetch(`${BASE_URL}/problems`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Lỗi lấy danh sách bài tập');
  return await res.json();
};

const createProblem = async (token, problemData) => {
  const res = await fetch(`${BASE_URL}/problems`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(problemData)
  });
  if (!res.ok) throw new Error('Lỗi tạo bài tập');
  return await res.json();
};

const updateProblem = async (token, id, problemData) => {
  const res = await fetch(`${BASE_URL}/problems/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(problemData)
  });
  if (!res.ok) throw new Error('Lỗi cập nhật bài tập');
  return await res.json();
};

const deleteProblem = async (token, id) => {
  const res = await fetch(`${BASE_URL}/problems/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Lỗi xóa bài tập');
  return await res.json();
};

const difficultyOptions = [
  { value: 'easy', label: 'Dễ', color: '#28a745' },
  { value: 'medium', label: 'Trung bình', color: '#fd7e14' },
  { value: 'hard', label: 'Khó', color: '#dc3545' },
  { value: 'expert', label: 'Rất khó', color: '#6f42c1' },
];

const languageOptions = [
  { value: 'cpp', label: 'C++' },
  { value: 'java', label: 'Java' },
  { value: 'python', label: 'Python' },
  { value: 'javascript', label: 'JavaScript' },
];

export default function ProblemManagementScreen() {
  const router = useRouter();
  const flatListRef = React.useRef();
  const [problems, setProblems] = useState([]);
  const [filteredProblems, setFilteredProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [currentProblem, setCurrentProblem] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'medium',
    inputFormat: '',
    outputFormat: '',
    constraints: '',
    sampleInput: '',
    sampleOutput: '',
    timeLimit: 1,
    memoryLimit: 256,
    languages: ['cpp', 'java', 'python'],
    tags: '',
  });
  const [formErrors, setFormErrors] = useState({});

  const loadProblems = async () => {
    setError(null);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Lỗi', 'Vui lòng đăng nhập lại');
        router.replace('/login');
        return;
      }

      const data = await getProblems(token);
      setProblems(Array.isArray(data.problems) ? data.problems : []);
      setFilteredProblems(Array.isArray(data.problems) ? data.problems : []);
    } catch (err) {
      setError(err.message || 'Lỗi khi tải danh sách bài tập');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProblems();
  }, []);

  // Filter problems
  useEffect(() => {
    let result = problems;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(problem =>
        (problem.title?.toLowerCase().includes(query) || false) ||
        (problem.description?.toLowerCase().includes(query) || false) ||
        (problem.tags?.some(tag => tag.toLowerCase().includes(query)) || false)
      );
    }

    if (selectedDifficulty !== 'all') {
      result = result.filter(problem => problem.difficulty === selectedDifficulty);
    }

    setFilteredProblems(result);
  }, [problems, searchQuery, selectedDifficulty]);

  const onRefresh = () => {
    setRefreshing(true);
    loadProblems();
  };

  const openAddModal = () => {
    setModalMode('add');
    setFormData({
      title: '',
      description: '',
      difficulty: 'medium',
      inputFormat: '',
      outputFormat: '',
      constraints: '',
      sampleInput: '',
      sampleOutput: '',
      timeLimit: 1,
      memoryLimit: 256,
      languages: ['cpp', 'java', 'python'],
      tags: '',
    });
    setFormErrors({});
    setCurrentProblem(null);
    setShowModal(true);
  };

  const openEditModal = (problem) => {
    console.log('Nhấn vào bài tập:', problem);
    setModalMode('edit');
    setFormData({
      title: problem.title || '',
      description: problem.description || '',
      difficulty: problem.difficulty || 'medium',
      inputFormat: problem.inputFormat || '',
      outputFormat: problem.outputFormat || '',
      constraints: problem.constraints || '',
      sampleInput: problem.sampleInput || '',
      sampleOutput: problem.sampleOutput || '',
      timeLimit: problem.timeLimit || 1,
      memoryLimit: problem.memoryLimit || 256,
      languages: Array.isArray(problem.languages) ? problem.languages : ['cpp', 'java', 'python'],
      tags: Array.isArray(problem.tags) ? problem.tags.join(', ') : '',
    });
    setFormErrors({});
    setCurrentProblem(problem);
    setShowModal(true);
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.title.trim()) {
      errors.title = 'Vui lòng nhập tiêu đề bài tập';
    }

    if (!formData.description.trim()) {
      errors.description = 'Vui lòng nhập mô tả bài tập';
    }

    if (formData.timeLimit <= 0) {
      errors.timeLimit = 'Thời gian giới hạn phải lớn hơn 0';
    }

    if (formData.memoryLimit <= 0) {
      errors.memoryLimit = 'Giới hạn bộ nhớ phải lớn hơn 0';
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
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      };

      if (modalMode === 'add') {
        result = await createProblem(token, submitData);
        if (result.success) {
          Alert.alert('Thành công', 'Thêm bài tập thành công');
          loadProblems();
          setShowModal(false);
          // Cuộn về đầu danh sách sau khi thêm
          setTimeout(() => {
            if (flatListRef && flatListRef.current) flatListRef.current.scrollToOffset({ offset: 0, animated: true });
          }, 300);
        }
      } else {
        result = await updateProblem(token, currentProblem._id, submitData);
        if (result.success) {
          Alert.alert('Thành công', 'Cập nhật bài tập thành công');
          loadProblems();
          setShowModal(false);
          // Cuộn về đầu danh sách sau khi cập nhật
          setTimeout(() => {
            if (flatListRef && flatListRef.current) flatListRef.current.scrollToOffset({ offset: 0, animated: true });
          }, 300);
        }
      }
    } catch (error) {
      Alert.alert('Lỗi', error.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = (problem) => {
    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc muốn xóa bài tập "${problem.title}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              const result = await deleteProblem(token, problem._id);
              if (result.success) {
                Alert.alert('Thành công', 'Xóa bài tập thành công');
                loadProblems();
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

  const toggleLanguage = (language) => {
    const newLanguages = formData.languages.includes(language)
      ? formData.languages.filter(l => l !== language)
      : [...formData.languages, language];
    updateFormData('languages', newLanguages);
  };

  const renderProblemItem = ({ item }) => (
    <TouchableOpacity
      style={styles.problemCard}
      onPress={() => {
        console.log('onPress bài tập:', item._id, item.title);
        openEditModal(item);
      }}
      activeOpacity={0.9}
    >
      <View style={styles.problemHeader}>
        <View style={styles.problemTitleRow}>
          <Text style={styles.problemTitle} numberOfLines={1}>{item.title}</Text>
          <View style={[
            styles.difficultyBadge,
            { backgroundColor: difficultyOptions.find(d => d.value === item.difficulty)?.color || '#fd7e14' }
          ]}>
            <Text style={styles.difficultyText}>
              {difficultyOptions.find(d => d.value === item.difficulty)?.label || item.difficulty}
            </Text>
          </View>
        </View>
        <Text style={styles.problemDesc} numberOfLines={2}>
          {item.description}
        </Text>
      </View>

      <View style={styles.problemDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={14} color="#666" />
          <Text style={styles.detailText}>Time: {item.timeLimit}s</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="hardware-chip-outline" size={14} color="#666" />
          <Text style={styles.detailText}>Memory: {item.memoryLimit}MB</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="code-outline" size={14} color="#666" />
          <Text style={styles.detailText} numberOfLines={1}>
            {Array.isArray(item.languages) ? item.languages.join(', ') : 'All'}
          </Text>
        </View>
      </View>

      <View style={styles.problemFooter}>
        {Array.isArray(item.tags) && item.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {item.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={styles.tagBadge}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
            {item.tags.length > 3 && (
              <Text style={styles.moreTags}>+{item.tags.length - 3}</Text>
            )}
          </View>
        )}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item)}
        >
          <Ionicons name="trash-outline" size={18} color="#dc3545" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#28a745" />
        <Text style={styles.loadingText}>Đang tải danh sách bài tập...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadProblems}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const problemStats = {
    total: problems.length,
    easy: problems.filter(p => p.difficulty === 'easy').length,
    medium: problems.filter(p => p.difficulty === 'medium').length,
    hard: problems.filter(p => p.difficulty === 'hard').length,
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
          <Text style={styles.title}>Quản lý bài tập</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={openAddModal}
          >
            <Ionicons name="add-circle" size={24} color="#28a745" />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.subtitle}>{problemStats.total} bài tập</Text>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{problemStats.total}</Text>
            <Text style={styles.statLabel}>Tổng số</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#28a745' }]}>{problemStats.easy}</Text>
            <Text style={styles.statLabel}>Dễ</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#fd7e14' }]}>{problemStats.medium}</Text>
            <Text style={styles.statLabel}>Trung bình</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#dc3545' }]}>{problemStats.hard}</Text>
            <Text style={styles.statLabel}>Khó</Text>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search-outline" size={18} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm bài tập..."
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
          style={[styles.filterButton, selectedDifficulty === 'all' && styles.filterButtonActive]}
          onPress={() => setSelectedDifficulty('all')}
        >
          <Text style={[styles.filterText, selectedDifficulty === 'all' && styles.filterTextActive]}>
            Tất cả
          </Text>
        </TouchableOpacity>
        {difficultyOptions.map(difficulty => (
          <TouchableOpacity
            key={difficulty.value}
            style={[
              styles.filterButton,
              selectedDifficulty === difficulty.value && styles.filterButtonActive,
              { borderLeftColor: difficulty.color }
            ]}
            onPress={() => setSelectedDifficulty(difficulty.value)}
          >
            <Text style={[styles.filterText, selectedDifficulty === difficulty.value && styles.filterTextActive]}>
              {difficulty.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Problem List */}
      <FlatList
        ref={flatListRef}
        data={filteredProblems}
        renderItem={renderProblemItem}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>Không tìm thấy bài tập nào</Text>
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
                {modalMode === 'add' ? 'Thêm bài tập mới' : 'Chỉnh sửa bài tập'}
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
                  placeholder="Nhập tiêu đề bài tập"
                />
                {formErrors.title ? <Text style={styles.errorText}>{formErrors.title}</Text> : null}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Mô tả *</Text>
                <TextInput
                  style={[styles.formTextArea, formErrors.description && styles.inputError]}
                  value={formData.description}
                  onChangeText={(text) => updateFormData('description', text)}
                  placeholder="Nhập mô tả bài tập"
                  multiline
                  numberOfLines={3}
                />
                {formErrors.description ? <Text style={styles.errorText}>{formErrors.description}</Text> : null}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Độ khó</Text>
                <View style={styles.radioGroup}>
                  {difficultyOptions.map(difficulty => (
                    <TouchableOpacity
                      key={difficulty.value}
                      style={[
                        styles.radioButton,
                        formData.difficulty === difficulty.value && styles.radioButtonActive,
                        { borderColor: difficulty.color }
                      ]}
                      onPress={() => updateFormData('difficulty', difficulty.value)}
                    >
                      <View style={[
                        styles.radioCircle,
                        formData.difficulty === difficulty.value && { backgroundColor: difficulty.color }
                      ]} />
                      <Text style={styles.radioLabel}>{difficulty.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Định dạng đầu vào</Text>
                <TextInput
                  style={styles.formTextArea}
                  value={formData.inputFormat}
                  onChangeText={(text) => updateFormData('inputFormat', text)}
                  placeholder="Mô tả định dạng đầu vào"
                  multiline
                  numberOfLines={2}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Định dạng đầu ra</Text>
                <TextInput
                  style={styles.formTextArea}
                  value={formData.outputFormat}
                  onChangeText={(text) => updateFormData('outputFormat', text)}
                  placeholder="Mô tả định dạng đầu ra"
                  multiline
                  numberOfLines={2}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Ràng buộc</Text>
                <TextInput
                  style={styles.formTextArea}
                  value={formData.constraints}
                  onChangeText={(text) => updateFormData('constraints', text)}
                  placeholder="Nhập các ràng buộc"
                  multiline
                  numberOfLines={2}
                />
              </View>

              <View style={styles.formRow}>
                <View style={styles.formHalf}>
                  <Text style={styles.formLabel}>Input mẫu</Text>
                  <TextInput
                    style={styles.formTextArea}
                    value={formData.sampleInput}
                    onChangeText={(text) => updateFormData('sampleInput', text)}
                    placeholder="Input mẫu"
                    multiline
                    numberOfLines={2}
                  />
                </View>
                <View style={styles.formHalf}>
                  <Text style={styles.formLabel}>Output mẫu</Text>
                  <TextInput
                    style={styles.formTextArea}
                    value={formData.sampleOutput}
                    onChangeText={(text) => updateFormData('sampleOutput', text)}
                    placeholder="Output mẫu"
                    multiline
                    numberOfLines={2}
                  />
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={styles.formHalf}>
                  <Text style={styles.formLabel}>Thời gian giới hạn (s) *</Text>
                  <TextInput
                    style={[styles.formInput, formErrors.timeLimit && styles.inputError]}
                    value={formData.timeLimit.toString()}
                    onChangeText={(text) => updateFormData('timeLimit', parseFloat(text) || 1)}
                    placeholder="Thời gian (giây)"
                    keyboardType="numeric"
                  />
                  {formErrors.timeLimit ? <Text style={styles.errorText}>{formErrors.timeLimit}</Text> : null}
                </View>
                <View style={styles.formHalf}>
                  <Text style={styles.formLabel}>Bộ nhớ giới hạn (MB) *</Text>
                  <TextInput
                    style={[styles.formInput, formErrors.memoryLimit && styles.inputError]}
                    value={formData.memoryLimit.toString()}
                    onChangeText={(text) => updateFormData('memoryLimit', parseInt(text) || 256)}
                    placeholder="Bộ nhớ (MB)"
                    keyboardType="numeric"
                  />
                  {formErrors.memoryLimit ? <Text style={styles.errorText}>{formErrors.memoryLimit}</Text> : null}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Ngôn ngữ hỗ trợ</Text>
                <View style={styles.languageGrid}>
                  {languageOptions.map(language => (
                    <TouchableOpacity
                      key={language.value}
                      style={[
                        styles.languageButton,
                        formData.languages.includes(language.value) && styles.languageButtonActive
                      ]}
                      onPress={() => toggleLanguage(language.value)}
                    >
                      <Text style={[
                        styles.languageText,
                        formData.languages.includes(language.value) && styles.languageTextActive
                      ]}>
                        {language.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Tags (phân cách bằng dấu phẩy)</Text>
                <TextInput
                  style={styles.formInput}
                  value={formData.tags}
                  onChangeText={(text) => updateFormData('tags', text)}
                  placeholder="VD: array, string, dp"
                />
              </View>

              <TouchableOpacity style={styles.submitButton} onPress={() => {
                console.log('Nhấn nút cập nhật/thêm bài tập', modalMode, formData);
                handleSubmit();
              }}>
                <LinearGradient
                  colors={['#28a745', '#20c997']}
                  style={styles.submitGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.submitButtonText}>
                    {modalMode === 'add' ? 'Thêm bài tập' : 'Cập nhật bài tập'}
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
    backgroundColor: '#28a745',
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
    color: '#28a745',
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
    borderLeftColor: '#28a745',
  },
  filterButtonActive: {
    backgroundColor: '#e9f9ed',
  },
  filterText: {
    color: '#666',
    fontSize: 13,
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#28a745',
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  problemCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  problemHeader: {
    marginBottom: 12,
  },
  problemTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  problemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  difficultyText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  problemDesc: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  problemDetails: {
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
  problemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    flexWrap: 'wrap',
  },
  tagBadge: {
    backgroundColor: '#e9ecef',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 11,
    color: '#666',
  },
  moreTags: {
    fontSize: 11,
    color: '#999',
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
  languageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  languageButton: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  languageButtonActive: {
    backgroundColor: '#28a745',
    borderColor: '#28a745',
  },
  languageText: {
    fontSize: 13,
    color: '#666',
  },
  languageTextActive: {
    color: '#fff',
    fontWeight: '600',
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