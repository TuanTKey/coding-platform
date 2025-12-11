import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, SafeAreaView, Text, TextInput } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProblemById, fetchProblemBySlug } from '../store/slices/problemSlice';
import { submitSolution } from '../store/slices/submissionSlice';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorAlert, SuccessAlert } from '../components/Alerts';
import { Button } from '../components/Button';
import { LanguageSelector } from '../components/LanguageSelector';
import { SectionHeader } from '../components/SectionHeader';

export const ProblemDetailScreen = ({ route, navigation }) => {
  const { problemId, slug } = route.params;
  const dispatch = useDispatch();
  const { currentProblem, sampleTestCases, loading, error } = useSelector(
    (state) => state.problems
  );
  const { submitting } = useSelector((state) => state.submissions);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [submitSuccess, setSubmitSuccess] = useState('');

  useEffect(() => {
    if (slug) {
      dispatch(fetchProblemBySlug(slug));
    } else {
      dispatch(fetchProblemById(problemId));
    }
  }, [problemId, slug]);

  const handleSubmit = async () => {
    if (!code.trim()) {
      alert('Please write some code first!');
      return;
    }

    try {
      const result = await dispatch(
        submitSolution({
          problemId: currentProblem._id,
          code,
          language,
        })
      ).unwrap();

      setSubmitSuccess('Code submitted successfully!');
      setCode('');

      // Navigate to submission details
      setTimeout(() => {
        navigation.navigate('SubmissionDetail', { submissionId: result.submissionId });
      }, 1500);
    } catch (err) {
      alert('Error submitting code: ' + err);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!currentProblem) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Problem not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.content}>
          <SuccessAlert message={submitSuccess} />
          <ErrorAlert message={error} />

          <SectionHeader title={currentProblem.title} subtitle={currentProblem.difficulty} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{currentProblem.description}</Text>
          </View>

          {currentProblem.inputFormat && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Input Format</Text>
              <Text style={styles.text}>{currentProblem.inputFormat}</Text>
            </View>
          )}

          {currentProblem.outputFormat && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Output Format</Text>
              <Text style={styles.text}>{currentProblem.outputFormat}</Text>
            </View>
          )}

          {currentProblem.constraints && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Constraints</Text>
              <Text style={styles.text}>{currentProblem.constraints}</Text>
            </View>
          )}

          {sampleTestCases.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sample Test Cases</Text>
              {sampleTestCases.map((tc, index) => (
                <View key={index} style={styles.testCase}>
                  <Text style={styles.testCaseLabel}>Input:</Text>
                  <Text style={styles.testCaseCode}>{tc.input}</Text>
                  <Text style={styles.testCaseLabel}>Output:</Text>
                  <Text style={styles.testCaseCode}>{tc.expectedOutput}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.section}>
            <LanguageSelector selectedLanguage={language} onSelect={setLanguage} />

            <Text style={styles.sectionTitle}>Code Editor</Text>
            <TextInput
              style={styles.codeEditor}
              placeholder="Write your code here..."
              value={code}
              onChangeText={setCode}
              multiline
              numberOfLines={10}
              fontFamily="Courier New"
            />
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title="Submit"
              onPress={handleSubmit}
              loading={submitting}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  text: {
    fontSize: 13,
    color: '#4b5563',
    lineHeight: 18,
  },
  testCase: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  testCaseLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
  },
  testCaseCode: {
    fontSize: 12,
    fontFamily: 'Courier New',
    color: '#1f2937',
    marginBottom: 8,
  },
  codeEditor: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    fontFamily: 'Courier New',
    color: '#1f2937',
    backgroundColor: '#f9fafb',
    minHeight: 200,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    marginVertical: 16,
  },
  errorText: {
    textAlign: 'center',
    color: '#ef4444',
    fontSize: 16,
    marginTop: 20,
  },
});
