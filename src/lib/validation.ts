export interface ValidationResult<T extends string> {
  isValid: boolean;
  errors: Partial<Record<T, string>>;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): string | null {
  const trimmed = email.trim();
  if (!trimmed) {
    return 'Email address is required.';
  }
  if (!EMAIL_PATTERN.test(trimmed)) {
    return 'Please enter a valid email address.';
  }
  return null;
}

export function validateLoginForm(values: {
  email: string;
  password: string;
}): ValidationResult<'email' | 'password'> {
  const errors: Partial<Record<'email' | 'password', string>> = {};
  const emailError = validateEmail(values.email);
  if (emailError) {
    errors.email = emailError;
  }
  if (!values.password) {
    errors.password = 'Password is required.';
  } else if (values.password.length < 8) {
    errors.password = 'Password must be at least 8 characters.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateRegisterForm(values: {
  fullName: string;
  email: string;
  role: string;
  password: string;
  confirmPassword: string;
  acceptedTerms: boolean;
}): ValidationResult<'fullName' | 'email' | 'role' | 'password' | 'confirmPassword' | 'acceptedTerms'> {
  const errors: Partial<
    Record<'fullName' | 'email' | 'role' | 'password' | 'confirmPassword' | 'acceptedTerms', string>
  > = {};

  if (!values.fullName.trim()) {
    errors.fullName = 'Full name is required.';
  } else if (values.fullName.trim().length < 2) {
    errors.fullName = 'Full name must be at least 2 characters.';
  }

  const emailError = validateEmail(values.email);
  if (emailError) {
    errors.email = emailError;
  }

  if (!values.role) {
    errors.role = 'Please select how you plan to use the platform.';
  }

  if (!values.password) {
    errors.password = 'Password is required.';
  } else if (values.password.length < 8) {
    errors.password = 'Use at least 8 characters for your password.';
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password.';
  } else if (values.password !== values.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  if (!values.acceptedTerms) {
    errors.acceptedTerms = 'Please acknowledge the Stage 1 preview terms.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateContactForm(values: {
  name: string;
  email: string;
  topic: string;
  message: string;
}): ValidationResult<'name' | 'email' | 'topic' | 'message'> {
  const errors: Partial<Record<'name' | 'email' | 'topic' | 'message', string>> = {};

  if (!values.name.trim()) {
    errors.name = 'Your name is required.';
  }

  const emailError = validateEmail(values.email);
  if (emailError) {
    errors.email = emailError;
  }

  if (!values.topic) {
    errors.topic = 'Please choose an inquiry topic.';
  }

  if (!values.message.trim()) {
    errors.message = 'Please enter a short message.';
  } else if (values.message.trim().length < 15) {
    errors.message = 'Message must be at least 15 characters.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
