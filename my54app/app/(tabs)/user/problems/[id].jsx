
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter, useSearchParams } from 'expo-router';

const BASE_URL = 'http://10.125.204.93:5000';

export default function ProblemDetail() {
  const { id, contestId: paramContestId } = useLocalSearchParams();
  const searchParams = useSearchParams ? useSearchParams() : {};
  // Ưu tiên contestId từ param, nếu không có thì lấy từ query
  const contestId = paramContestId || searchParams.contestId;
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  const [input, setInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const router = useRouter();

  const fetchProblem = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        router.replace('/login');
        return;
      }
      const res = await fetch(`${BASE_URL}/api/problems/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Không thể lấy chi tiết bài tập');
      const data = await res.json();
      setProblem(data.problem || data);
    } catch (err) {
      Alert.alert('Lỗi', err.message || 'Không thể tải bài tập');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblem();
  }, [id]);

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setResult(null);
      const token = await AsyncStorage.getItem('token');
      const body = { problemId: id, code, language: 'python' };
      if (contestId) body.contestId = contestId;
      const res = await fetch(`${BASE_URL}/api/submissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Nộp bài thất bại');
      setResult(data);
      Alert.alert('Nộp bài thành công', 'Bài của bạn đã được gửi đi chấm!', [
        {
          text: 'OK',
          onPress: () => {
            if (contestId) {
              // Quay lại trang contest detail
              router.replace(`/user/contests/${contestId}`);
            }
          },
        },
      ]);
    } catch (err) {
      Alert.alert('Lỗi', err.message || 'Nộp bài thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTest = async () => {
    try {
      setTesting(true);
      setTestResult(null);
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/api/submissions/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ code, language: 'python', input }),
      });
      const data = await res.json();
      setTestResult(data);
    } catch (err) {
      setTestResult({ error: err.message || 'Lỗi chạy thử code' });
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#007bff" />
        </View>
      </SafeAreaView>
    );
  }

  if (!problem) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <Text>Không tìm thấy bài tập.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>{problem.title}</Text>
        <Text style={styles.meta}>Độ khó: <Text style={{ color: getDifficultyColor(problem.difficulty) }}>{problem.difficulty}</Text></Text>
        <Text style={styles.description}>{problem.description}</Text>
        <Text style={styles.sectionTitle}>Code của bạn:</Text>
        <TextInput
          style={styles.codeInput}
          multiline
          value={code}
          onChangeText={setCode}
          placeholder="Viết code tại đây..."
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Text style={styles.sectionTitle}>Input mẫu (tùy chọn):</Text>
        <TextInput
          style={styles.inputBox}
          multiline
          value={input}
          onChangeText={setInput}
          placeholder="Nhập input mẫu để chạy thử..."
          autoCapitalize="none"
          autoCorrect={false}
        />
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
          <TouchableOpacity style={[styles.testBtn, testing && { opacity: 0.7 }]} onPress={handleTest} disabled={testing}>
            <Ionicons name="play" size={18} color="#fff" style={{ marginRight: 4 }} />
            <Text style={styles.submitText}>{testing ? 'Đang chạy...' : 'Chạy thử'}</Text>
          </TouchableOpacity>
          {/* Luôn hiện nút nộp bài, cả khi là bài tập trong contest */}
          <TouchableOpacity style={[styles.submitBtn, submitting && { opacity: 0.7 }]} onPress={handleSubmit} disabled={submitting}>
            <Ionicons name="cloud-upload-outline" size={20} color="#fff" style={{ marginRight: 6 }} />
            <Text style={styles.submitText}>{submitting ? 'Đang nộp...' : 'Nộp bài'}</Text>
          </TouchableOpacity>
        </View>
        {testResult && (
          <View style={styles.resultBox}>
            <Text style={styles.resultTitle}>Kết quả chạy thử:</Text>
            {testResult.output && <Text style={styles.resultText}>Output: {testResult.output}</Text>}
            {testResult.error && <Text style={[styles.resultText, { color: '#dc3545' }]}>Lỗi: {testResult.error}</Text>}
            {typeof testResult.executionTime !== 'undefined' && (
              <Text style={styles.resultText}>Thời gian chạy: {testResult.executionTime} ms</Text>
            )}
          </View>
        )}
        {result && (
          <View style={styles.resultBox}>
            <Text style={styles.resultTitle}>Kết quả nộp bài:</Text>
            <Text style={styles.resultText}>{result.status || JSON.stringify(result)}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const getDifficultyColor = (difficulty) => {
  if (difficulty === 'easy') return '#28a745';
  if (difficulty === 'medium') return '#fd7e14';
  if (difficulty === 'hard') return '#dc3545';
  return '#888';
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
    color: '#007bff',
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
    color: '#007bff',
  },
  codeInput: {
    minHeight: 120,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    fontSize: 15,
    color: '#222',
    padding: 12,
    marginBottom: 12,
    fontFamily: 'monospace',
  },
  inputBox: {
    minHeight: 40,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    fontSize: 15,
    color: '#222',
    padding: 10,
    marginBottom: 12,
    fontFamily: 'monospace',
  },
  testBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#28a745',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 18,
    justifyContent: 'center',
    marginRight: 8,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007bff',
    borderRadius: 8,
    paddingVertical: 12,
    justifyContent: 'center',
    marginBottom: 18,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultBox: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: '#eee',
  },
  resultTitle: {
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 4,
  },
  resultText: {
    color: '#333',
    fontSize: 15,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
