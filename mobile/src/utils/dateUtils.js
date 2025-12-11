import { formatDistanceToNow, format } from 'date-fns';

export const formatDate = (date) => {
  return format(new Date(date), 'PPp');
};

export const formatDateRelative = (date) => {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export const formatDateTime = (date) => {
  return format(new Date(date), 'PPpp');
};
