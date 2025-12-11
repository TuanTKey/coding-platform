/**
 * Utility functions for the mobile app
 */

export const formatDate = (date) => {
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const year = d.getFullYear();
  return `${month}/${day}/${year}`;
};

export const formatTime = (date) => {
  const d = new Date(date);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

export const formatDateTime = (date) => {
  return `${formatDate(date)} ${formatTime(date)}`;
};

export const getDifficultyColor = (difficulty) => {
  switch (difficulty?.toLowerCase()) {
    case 'easy': return '#52c41a';
    case 'medium': return '#faad14';
    case 'hard': return '#f5222d';
    default: return '#999';
  }
};

export const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'accepted': return '#52c41a';
    case 'wrong_answer': return '#f5222d';
    case 'runtime_error': return '#faad14';
    case 'time_limit_exceeded': return '#faad14';
    case 'pending': return '#999';
    default: return '#999';
  }
};

export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const formatScore = (score, totalScore) => {
  if (!totalScore) return '0';
  const percentage = ((score / totalScore) * 100).toFixed(0);
  return `${score}/${totalScore} (${percentage}%)`;
};
