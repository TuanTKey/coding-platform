import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export const TestCaseViewer = ({ testCases, results }) => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Test Cases</Text>
      {testCases.map((testCase, index) => {
        const result = results?.[index];
        const passed = result?.status === 'passed';

        return (
          <View key={index} style={[styles.testCase, passed && styles.passedTestCase]}>
            <Text style={styles.testCaseHeader}>Test Case {index + 1}</Text>

            <View style={styles.codeBlock}>
              <Text style={styles.label}>Input:</Text>
              <Text style={styles.codeText}>{testCase.input}</Text>
            </View>

            <View style={styles.codeBlock}>
              <Text style={styles.label}>Expected Output:</Text>
              <Text style={styles.codeText}>{testCase.expectedOutput}</Text>
            </View>

            {result && (
              <>
                <View style={styles.codeBlock}>
                  <Text style={styles.label}>Your Output:</Text>
                  <Text style={styles.codeText}>{result.output || 'No output'}</Text>
                </View>

                {result.error && (
                  <View style={[styles.codeBlock, styles.errorBlock]}>
                    <Text style={styles.label}>Error:</Text>
                    <Text style={styles.errorText}>{result.error}</Text>
                  </View>
                )}
              </>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  testCase: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#d1d5db',
  },
  passedTestCase: {
    borderLeftColor: '#10b981',
  },
  testCaseHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  codeBlock: {
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
  },
  codeText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#1f2937',
  },
  errorBlock: {
    backgroundColor: '#fee2e2',
    borderColor: '#fca5a5',
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#dc2626',
  },
});
