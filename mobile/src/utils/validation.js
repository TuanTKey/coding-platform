export const validateEmail = (email) => {
  const emailRegex = /^\S+@\S+\.\S+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  return password && password.length >= 6;
};

export const validateUsername = (username) => {
  return username && username.length >= 3 && username.length <= 50;
};

export const validateForm = (formData, fields) => {
  const errors = {};

  fields.forEach((field) => {
    switch (field) {
      case 'username':
        if (!validateUsername(formData.username)) {
          errors.username = 'Username must be 3-50 characters';
        }
        break;
      case 'email':
        if (!validateEmail(formData.email)) {
          errors.email = 'Invalid email address';
        }
        break;
      case 'password':
        if (!validatePassword(formData.password)) {
          errors.password = 'Password must be at least 6 characters';
        }
        break;
      case 'fullName':
        if (!formData.fullName || formData.fullName.trim().length === 0) {
          errors.fullName = 'Full name is required';
        }
        break;
      case 'class':
        if (!formData.userClass) {
          errors.userClass = 'Class is required';
        }
        break;
      default:
        break;
    }
  });

  return errors;
};
