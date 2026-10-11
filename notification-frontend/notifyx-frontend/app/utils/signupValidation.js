
export function validateSignup(values) {
  const errors = {};

  if (!values.fullName.trim()) {
    errors.fullName = "Enter your full name.";
  }

  if (!values.email.trim()) {
    errors.email = "Enter your work email.";
  } else if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())
  ) {
    errors.email = "Enter a valid email address.";
  }

  if (!values.password) {
    errors.password = "Create a password.";
  } else if (
    values.password.length < 8 ||
    !/[A-Za-z]/.test(values.password) ||
    !/\d/.test(values.password)
  ) {
    errors.password =
      "Use at least 8 characters, including a letter and a number.";
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = "Confirm your password.";
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = "Your passwords do not match.";
  }

  if (!values.terms) {
    errors.terms =
      "Please agree to the Terms of Service and Privacy Policy.";
  }

  return errors;
}
