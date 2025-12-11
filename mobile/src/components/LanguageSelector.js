import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';

export const LanguageSelector = ({ selectedLanguage, onSelect }) => {
  const languages = ['python', 'javascript', 'cpp', 'java'];

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Language</Text>
      <View style={styles.buttonGroup}>
        {languages.map((lang) => (
          <TouchableOpacity
            key={lang}
            style={[
              styles.languageButton,
              selectedLanguage === lang && styles.activeLanguage,
            ]}
            onPress={() => onSelect(lang)}
          >
            <Text
              style={[
                styles.languageText,
                selectedLanguage === lang && styles.activeLanguageText,
              ]}
            >
              {lang.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  languageButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
  },
  activeLanguage: {
    backgroundColor: '#0891b2',
    borderColor: '#0891b2',
  },
  languageText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeLanguageText: {
    color: '#fff',
  },
});
