export const getDifficultyColor = (difficulty) => {
  switch (difficulty) {
    case "easy":
      return {
        bg: "bg-green-100",
        text: "text-green-800",
        badge: "bg-green-500",
      };
    case "medium":
      return {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        badge: "bg-yellow-500",
      };
    case "hard":
      return {
        bg: "bg-red-100",
        text: "text-red-800",
        badge: "bg-red-500",
      };
    default:
      return {
        bg: "bg-gray-100",
        text: "text-gray-800",
        badge: "bg-gray-500",
      };
  }
};

export const getStatusColor = (status) => {
  switch (status) {
    case "accepted":
      return {
        bg: "bg-green-100",
        text: "text-green-800",
        badge: "bg-green-500",
      };
    case "wrong_answer":
      return {
        bg: "bg-red-100",
        text: "text-red-800",
        badge: "bg-red-500",
      };
    case "time_limit":
      return {
        bg: "bg-orange-100",
        text: "text-orange-800",
        badge: "bg-orange-500",
      };
    case "pending":
    case "judging":
      return {
        bg: "bg-blue-100",
        text: "text-blue-800",
        badge: "bg-blue-500",
      };
    case "compile_error":
    case "runtime_error":
      return {
        bg: "bg-red-100",
        text: "text-red-800",
        badge: "bg-red-500",
      };
    default:
      return {
        bg: "bg-gray-100",
        text: "text-gray-800",
        badge: "bg-gray-500",
      };
  }
};

export const getStatusLabel = (status) => {
  const labels = {
    accepted: "Accepted",
    wrong_answer: "Wrong Answer",
    time_limit: "Time Limit",
    memory_limit: "Memory Limit",
    runtime_error: "Runtime Error",
    compile_error: "Compile Error",
    pending: "Pending",
    judging: "Judging",
  };
  return labels[status] || status;
};

export const formatDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

export const formatTime = (date) => {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatDateTime = (date) => {
  return `${formatDate(date)} ${formatTime(date)}`;
};

export const calculateAcceptanceRate = (accepted, total) => {
  if (total === 0) return 0;
  return ((accepted / total) * 100).toFixed(1);
};
