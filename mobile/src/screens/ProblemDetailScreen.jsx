import React from 'react';
import { StyleSheet, View, Text, TextInput, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { problemService, submissionService } from '../services/authAPI';
import { Card, GradientButton } from '../components/Button';

export function ProblemDetailScreen({ route, navigation }) {
  const { slug } = route.params;
  const [problem, setProblem] = React.useState(null);
  const [code, setCode] = React.useState('');
  const [language, setLanguage] = React.useState('python');
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [output, setOutput] = React.useState('');
  const [showOutput, setShowOutput] = React.useState(false);

  React.useEffect(() => {
    loadProblem();
  }, []);

  const loadProblem = async () => {
    try {
      setLoading(true);
      const response = await problemService.getProblemBySlug(slug);
      setProblem(response.data);
    } catch (error) {
      console.error('Failed to load problem:', error);
      alert('Failed to load problem');
    } finally {
      setLoading(false);
    }
  };

  const handleRunCode = async () => {
    try {
      setSubmitting(true);
      const response = await submissionService.runCode({
        problemId: problem._id,
        code,
        language,
      });
      setOutput(response.data.output || 'Code executed successfully');
      setShowOutput(true);
    } catch (error) {
      alert('Failed to run code: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const response = await submissionService.submitCode({
        problemId: problem._id,
        code,
        language,
      });
      alert('Code submitted successfully!');
      navigation.goBack();
    } catch (error) {
      alert('Failed to submit: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  if (!problem) {
    return (
      <View style={styles.centerContainer}>
        <Text>Problem not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Problem Header */}
        <Card>
          <View style={styles.header}>
            <Text style={styles.title}>{problem.title}</Text>
            <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(problem.difficulty) }]}>
              <Text style={styles.difficultyText}>{problem.difficulty}</Text>
            </View>
          </View>
        </Card>

        {/* Problem Description */}
        <Card>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{problem.description}</Text>
        </Card>

        {/* Examples */}
        {problem.testCases && problem.testCases.length > 0 && (
          <Card>
            <Text style={styles.sectionTitle}>Examples</Text>
            {problem.testCases.slice(0, 2).map((testCase, index) => (
              <View key={index} style={styles.example}>
                <Text style={styles.exampleLabel}>Example {index + 1}:</Text>
                <Text style={styles.exampleText}>Input: {testCase.input}</Text>
                <Text style={styles.exampleText}>Output: {testCase.output}</Text>
              </View>
            ))}
          </Card>
        )}

        {/* Code Editor */}
        <Card>
          <Text style={styles.sectionTitle}>Language</Text>
          <View style={styles.languageSelector}>
            {['python', 'javascript', 'cpp', 'java'].map((lang) => (
              <TouchableOpacity
                key={lang}
                style={[styles.langButton, language === lang && styles.langButtonActive]}
                onPress={() => setLanguage(lang)}
              >
                <Text style={[styles.langButtonText, language === lang && styles.langButtonTextActive]}>
                  {lang.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Code</Text>
          <TextInput
            style={styles.codeEditor}
            placeholder="Write your code here..."
            value={code}
            onChangeText={setCode}
            multiline
            editable={!submitting}
            placeholderTextColor="#999"
          />
        </Card>

        {/* Output */}
        {showOutput && (
          <Card>
            <Text style={styles.sectionTitle}>Output</Text>
            <View style={styles.output}>
              <Text style={styles.outputText}>{output}</Text>
            </View>
          </Card>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <GradientButton
            onPress={handleRunCode}
            title={submitting ? 'Running...' : 'Run Code'}
            variant="secondary"
            style={{ flex: 1, marginRight: 8 }}
          />
          <GradientButton
            onPress={handleSubmit}
            title={submitting ? 'Submitting...' : 'Submit'}
            style={{ flex: 1 }}
          />
        </View>
      </View>
    </ScrollView>
  );
}

function getDifficultyColor(difficulty) {
  switch (difficulty?.toLowerCase()) {
    case 'easy': return '#52c41a';
    case 'medium': return '#faad14';
    case 'hard': return '#f5222d';
    default: return '#999';
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  description: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },
  example: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  exampleLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  exampleText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
    fontFamily: 'monospace',
  },
  languageSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  langButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  langButtonActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  langButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#999',
  },
  langButtonTextActive: {
    color: '#fff',
  },
  codeEditor: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    fontSize: 12,
    fontFamily: 'monospace',
    minHeight: 200,
    textAlignVertical: 'top',
  },
  output: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#667eea',
  },
  outputText: {
    fontSize: 12,
    color: '#333',
    fontFamily: 'monospace',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    marginBottom: 20,
  },
});
