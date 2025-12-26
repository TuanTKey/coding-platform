import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator, SafeAreaView, TouchableOpacity, TextInput, RefreshControl, Alert, StatusBar, Modal, ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://10.125.204.93:5000/api';

const getSubmissions = async (token) => {
  const res = await fetch(`${BASE_URL}/submissions/admin/all`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Lỗi lấy danh sách bài nộp');
  return await res.json();
};

const getSubmissionDetail = async (token, id) => {
  const res = await fetch(`${BASE_URL}/submissions/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Lỗi lấy chi tiết bài nộp');
  return await res.json();
};

const statusColors = {
  'AC': { label: 'Đúng', color: '#28a745', bg: '#d4edda' },
  'WA': { label: 'Sai', color: '#dc3545', bg: '#f8d7da' },
  'TLE': { label: 'Quá thời gian', color: '#fd7e14', bg: '#fff3cd' },
  'MLE': { label: 'Quá bộ nhớ', color: '#6f42c1', bg: '#e2d9f3' },
  'RE': { label: 'Lỗi thực thi', color: '#dc3545', bg: '#f8d7da' },
  'CE': { label: 'Lỗi biên dịch', color: '#6c757d', bg: '#e2e3e5' },
  'PE': { label: 'Định dạng sai', color: '#17a2b8', bg: '#d1ecf1' },
  'pending': { label: 'Đang chấm', color: '#007bff', bg: '#cce5ff' },
  'running': { label: 'Đang chạy', color: '#20c997', bg: '#d1f2eb' },
};

const languageIcons = {
  'cpp': 'code-slash', // Ionicons does not support logo-cplusplus
  'java': 'cafe',      // Ionicons does not support logo-java
  'python': 'logo-python',
  'javascript': 'logo-javascript',
};

export default function SubmissionManagementScreen() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadSubmissions = async () => {
    setError(null);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Lỗi', 'Vui lòng đăng nhập lại');
        router.replace('/login');
        return;
      }
      const data = await getSubmissions(token);
      const sortedSubmissions = Array.isArray(data.submissions) 
        ? data.submissions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        : [];
      setSubmissions(sortedSubmissions);
      setFilteredSubmissions(sortedSubmissions);
    } catch (err) {
      setError(err.message || 'Lỗi khi tải danh sách bài nộp');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  useEffect(() => {
    let result = submissions;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(sub => {
        const userName = sub.user?.fullName?.toLowerCase() || sub.user?.username?.toLowerCase() || '';
        const problemTitle = sub.problem?.title?.toLowerCase() || '';
        const userEmail = sub.user?.email?.toLowerCase() || '';
        return userName.includes(query) || problemTitle.includes(query) || userEmail.includes(query);
      });
    }

    if (selectedStatus !== 'all') {
      result = result.filter(sub => sub.status === selectedStatus);
    }

    setFilteredSubmissions(result);
  }, [submissions, searchQuery, selectedStatus]);

  const onRefresh = () => {
    setRefreshing(true);
    loadSubmissions();
  };

  const handleViewDetail = async (submission) => {
    setDetailLoading(true);
    setSelectedSubmission(submission);
    try {
      const token = await AsyncStorage.getItem('token');
      const data = await getSubmissionDetail(token, submission._id);
      setSelectedSubmission(data.submission || submission);
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể tải chi tiết bài nộp');
    } finally {
      setDetailLoading(false);
    }
    setShowDetailModal(true);
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  const formatRuntime = (runtime) => {
    if (!runtime) return 'N/A';
    return `${runtime}ms`;
  };

  const renderSubmissionItem = ({ item }) => {
    const statusInfo = statusColors[item.status] || { label: item.status, color: '#6c757d', bg: '#e2e3e5' };
    const languageIcon = languageIcons[item.language] || 'code-outline';

    return (
      <TouchableOpacity
        style={styles.submissionCard}
        onPress={() => handleViewDetail(item)}
        activeOpacity={0.9}
      >
        <View style={styles.submissionHeader}>
          <View style={styles.problemInfo}>
            <Text style={styles.problemTitle} numberOfLines={1}>
              {item.problem?.title || 'Bài tập không xác định'}
            </Text>
            <View style={styles.userInfo}>
              <Ionicons name="person-outline" size={12} color="#666" />
              <Text style={styles.userName}>
                {item.user?.fullName || item.user?.username || 'Người dùng không xác định'}
              </Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
            <Text style={[styles.statusText, { color: statusInfo.color }]}>
              {statusInfo.label}
            </Text>
          </View>
        </View>

        <View style={styles.submissionDetails}>
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Ionicons name="code-outline" size={14} color="#666" />
              <Text style={styles.detailText}>
                <Ionicons name={languageIcon} size={14} color="#007bff" style={{ marginHorizontal: 4 }} />
                {item.language?.toUpperCase() || 'N/A'}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="time-outline" size={14} color="#666" />
              <Text style={styles.detailText}>
                {formatRuntime(item.runtime)}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="hardware-chip-outline" size={14} color="#666" />
              <Text style={styles.detailText}>
                {item.memory ? `${item.memory}KB` : 'N/A'}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Ionicons name="checkmark-circle-outline" size={14} color="#666" />
              <Text style={styles.detailText}>
                Điểm: <Text style={styles.scoreText}>{item.score || 0}</Text>
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="calendar-outline" size={14} color="#666" />
              <Text style={styles.detailText}>
                {formatTime(item.createdAt)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.submissionFooter}>
          {item.testCases && (
            <View style={styles.testCaseInfo}>
              <Ionicons name="list-outline" size={14} color="#666" />
              <Text style={styles.testCaseText}>
                Test case: {item.passedTestCases || 0}/{item.totalTestCases || 0}
              </Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.viewButton}
            onPress={() => handleViewDetail(item)}
          >
            <Text style={styles.viewButtonText}>Xem chi tiết</Text>
            <Ionicons name="chevron-forward" size={16} color="#007bff" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Đang tải danh sách bài nộp...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadSubmissions}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const submissionStats = {
    total: submissions.length,
    accepted: submissions.filter(s => s.status === 'AC').length,
    pending: submissions.filter(s => s.status === 'pending' || s.status === 'running').length,
  };

  const statusOptions = [
    { value: 'all', label: 'Tất cả' },
    { value: 'AC', label: 'Đúng' },
    { value: 'WA', label: 'Sai' },
    { value: 'pending', label: 'Đang chấm' },
    { value: 'running', label: 'Đang chạy' },
    { value: 'TLE', label: 'Quá thời gian' },
    { value: 'MLE', label: 'Quá bộ nhớ' },
    { value: 'CE', label: 'Lỗi biên dịch' },
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
          <Text style={styles.title}>Quản lý bài nộp</Text>
        </View>
        
        <Text style={styles.subtitle}>{submissionStats.total} bài nộp</Text>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{submissionStats.total}</Text>
            <Text style={styles.statLabel}>Tổng số</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#28a745' }]}>{submissionStats.accepted}</Text>
            <Text style={styles.statLabel}>Đúng</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#007bff' }]}>{submissionStats.pending}</Text>
            <Text style={styles.statLabel}>Đang chấm</Text>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search-outline" size={18} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm bài nộp..."
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

      {/* Status Filters */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContainer}
      >
        {statusOptions.map(option => {
          const statusColor = statusColors[option.value]?.color || '#6c757d';
          return (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.filterButton,
                selectedStatus === option.value && styles.filterButtonActive,
                { borderLeftColor: statusColor }
              ]}
              onPress={() => setSelectedStatus(option.value)}
            >
              <Text style={[
                styles.filterText,
                selectedStatus === option.value && styles.filterTextActive,
                selectedStatus === option.value && { color: statusColor }
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Submission List */}
      <FlatList
        data={filteredSubmissions}
        renderItem={renderSubmissionItem}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>Không tìm thấy bài nộp nào</Text>
          </View>
        }
      />

      {/* Detail Modal */}
      <Modal
        visible={showDetailModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDetailModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {detailLoading ? (
              <View style={styles.detailLoading}>
                <ActivityIndicator size="large" color="#007bff" />
                <Text>Đang tải chi tiết...</Text>
              </View>
            ) : selectedSubmission && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Chi tiết bài nộp</Text>
                  <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                    <Ionicons name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalBody}>
                  {/* Status Summary */}
                  <View style={styles.detailCard}>
                    <View style={styles.detailHeader}>
                      <Text style={styles.detailSectionTitle}>Tổng quan</Text>
                      <View style={[
                        styles.detailStatusBadge,
                        { backgroundColor: statusColors[selectedSubmission.status]?.bg || '#e2e3e5' }
                      ]}>
                        <Text style={[
                          styles.detailStatusText,
                          { color: statusColors[selectedSubmission.status]?.color || '#6c757d' }
                        ]}>
                          {statusColors[selectedSubmission.status]?.label || selectedSubmission.status}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.detailInfoGrid}>
                      <View style={styles.detailInfoItem}>
                        <Text style={styles.detailInfoLabel}>Bài tập:</Text>
                        <Text style={styles.detailInfoValue}>
                          {selectedSubmission.problem?.title || 'N/A'}
                        </Text>
                      </View>
                      <View style={styles.detailInfoItem}>
                        <Text style={styles.detailInfoLabel}>Người nộp:</Text>
                        <Text style={styles.detailInfoValue}>
                          {selectedSubmission.user?.fullName || selectedSubmission.user?.username || 'N/A'}
                        </Text>
                      </View>
                      <View style={styles.detailInfoItem}>
                        <Text style={styles.detailInfoLabel}>Ngôn ngữ:</Text>
                        <View style={styles.languageBadge}>
                          <Ionicons 
                            name={languageIcons[selectedSubmission.language] || 'code-outline'} 
                            size={16} 
                            color="#007bff" 
                          />
                          <Text style={styles.languageText}>
                            {selectedSubmission.language?.toUpperCase() || 'N/A'}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.detailInfoItem}>
                        <Text style={styles.detailInfoLabel}>Thời gian chạy:</Text>
                        <Text style={styles.detailInfoValue}>
                          {formatRuntime(selectedSubmission.runtime)}
                        </Text>
                      </View>
                      <View style={styles.detailInfoItem}>
                        <Text style={styles.detailInfoLabel}>Bộ nhớ:</Text>
                        <Text style={styles.detailInfoValue}>
                          {selectedSubmission.memory ? `${selectedSubmission.memory}KB` : 'N/A'}
                        </Text>
                      </View>
                      <View style={styles.detailInfoItem}>
                        <Text style={styles.detailInfoLabel}>Điểm:</Text>
                        <Text style={[styles.detailInfoValue, { color: '#28a745', fontWeight: 'bold' }]}>
                          {selectedSubmission.score || 0}
                        </Text>
                      </View>
                      <View style={styles.detailInfoItem}>
                        <Text style={styles.detailInfoLabel}>Thời gian nộp:</Text>
                        <Text style={styles.detailInfoValue}>
                          {new Date(selectedSubmission.createdAt).toLocaleString('vi-VN')}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Test Cases */}
                  {selectedSubmission.testCases && (
                    <View style={styles.detailCard}>
                      <Text style={styles.detailSectionTitle}>Test Cases</Text>
                      <View style={styles.testCaseProgress}>
                        <Text style={styles.testCaseCount}>
                          {selectedSubmission.passedTestCases || 0}/{selectedSubmission.totalTestCases || 0} passed
                        </Text>
                        <View style={styles.progressBar}>
                          <View 
                            style={[
                              styles.progressFill,
                              { 
                                width: `${((selectedSubmission.passedTestCases || 0) / (selectedSubmission.totalTestCases || 1)) * 100}%` 
                              }
                            ]} 
                          />
                        </View>
                      </View>
                      {Array.isArray(selectedSubmission.testCases) && selectedSubmission.testCases.map((testCase, index) => (
                        <View key={index} style={styles.testCaseItem}>
                          <View style={styles.testCaseHeader}>
                            <Text style={styles.testCaseName}>Test case #{index + 1}</Text>
                            <View style={[
                              styles.testCaseStatus,
                              testCase.status === 'passed' 
                                ? { backgroundColor: '#d4edda' }
                                : { backgroundColor: '#f8d7da' }
                            ]}>
                              <Text style={[
                                styles.testCaseStatusText,
                                testCase.status === 'passed' 
                                  ? { color: '#28a745' }
                                  : { color: '#dc3545' }
                              ]}>
                                {testCase.status === 'passed' ? 'Passed' : 'Failed'}
                              </Text>
                            </View>
                          </View>
                          {testCase.message && (
                            <Text style={styles.testCaseMessage}>{testCase.message}</Text>
                          )}
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Code */}
                  {selectedSubmission.code && (
                    <View style={styles.detailCard}>
                      <Text style={styles.detailSectionTitle}>Mã nguồn</Text>
                      <View style={styles.codeContainer}>
                        <ScrollView horizontal>
                          <Text style={styles.codeText} selectable>
                            {selectedSubmission.code}
                          </Text>
                        </ScrollView>
                      </View>
                    </View>
                  )}
                </ScrollView>
              </>
            )}
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
    marginBottom: 8,
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
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
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  submissionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  submissionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  problemInfo: {
    flex: 1,
    marginRight: 12,
  },
  problemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    fontSize: 13,
    color: '#666',
    marginLeft: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  submissionDetails: {
    backgroundColor: '#fafafa',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
  },
  scoreText: {
    fontWeight: 'bold',
    color: '#28a745',
  },
  submissionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  testCaseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  testCaseText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewButtonText: {
    fontSize: 13,
    color: '#007bff',
    fontWeight: '500',
    marginRight: 4,
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
  detailLoading: {
    padding: 40,
    alignItems: 'center',
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
  modalBody: {
    padding: 16,
  },
  detailCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  detailStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  detailStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  detailInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  detailInfoItem: {
    width: '50%',
    paddingHorizontal: 8,
    marginBottom: 12,
  },
  detailInfoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  detailInfoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  languageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    marginLeft: 6,
  },
  testCaseProgress: {
    marginBottom: 16,
  },
  testCaseCount: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e9ecef',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#28a745',
  },
  testCaseItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  testCaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  testCaseName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  testCaseStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  testCaseStatusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  testCaseMessage: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  codeContainer: {
    backgroundColor: '#1e1e1e',
    borderRadius: 8,
    padding: 12,
    maxHeight: 300,
  },
  codeText: {
    fontFamily: 'monospace',
    fontSize: 13,
    color: '#d4d4d4',
    lineHeight: 20,
  },
});