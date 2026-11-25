export interface ValidationResult<T extends string> {
  isValid: boolean;
  errors: Partial<Record<T, string>>;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_PATTERN = /^[a-z0-9_]{3,30}$/;

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

export interface PasswordStrengthResult {
  score: number;
  label: string;
  isValid: boolean;
  checks: Array<{ id: string; label: string; passed: boolean }>;
}

export function evaluatePasswordStrength(password: string): PasswordStrengthResult {
  const checks = [
    { id: 'length', label: 'At least 8 characters', passed: password.length >= 8 },
    { id: 'lower', label: 'One lowercase letter', passed: /[a-z]/.test(password) },
    { id: 'upper', label: 'One uppercase letter', passed: /[A-Z]/.test(password) },
    { id: 'digit', label: 'One number', passed: /\d/.test(password) },
    {
      id: 'special',
      label: 'One special character',
      passed: /[^A-Za-z0-9]/.test(password),
    },
  ];
  const score = checks.filter((c) => c.passed).length;
  const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  return {
    score,
    label: score === 0 ? 'Too Short' : labels[score - 1],
    isValid: score === checks.length && password.length <= 128,
    checks,
  };
}

export function validateStrongPassword(password: string): string | null {
  if (!password) {
    return 'Password is required.';
  }
  if (password.length < 8) {
    return 'Password must be at least 8 characters long.';
  }
  if (password.length > 128) {
    return 'Password must not exceed 128 characters.';
  }
  if (!/[a-z]/.test(password)) {
    return 'Password must include at least one lowercase letter.';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must include at least one uppercase letter.';
  }
  if (!/\d/.test(password)) {
    return 'Password must include at least one number.';
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return 'Password must include at least one special character.';
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
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateRegisterForm(values: {
  invitationToken: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptedTerms: boolean;
}): ValidationResult<
  'invitationToken' | 'email' | 'password' | 'confirmPassword' | 'acceptedTerms'
> {
  const errors: Partial<
    Record<
      'invitationToken' | 'email' | 'password' | 'confirmPassword' | 'acceptedTerms',
      string
    >
  > = {};

  if (!values.invitationToken.trim()) {
    errors.invitationToken = 'An invitation token is required to register.';
  } else if (values.invitationToken.trim().length < 16) {
    errors.invitationToken = 'Invitation token appears invalid.';
  }

  const emailError = validateEmail(values.email);
  if (emailError) {
    errors.email = emailError;
  }

  const passwordError = validateStrongPassword(values.password);
  if (passwordError) {
    errors.password = passwordError;
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password.';
  } else if (values.password !== values.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  if (!values.acceptedTerms) {
    errors.acceptedTerms = 'Please accept the Terms of Service and Privacy Policy.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateResetPasswordForm(values: {
  newPassword: string;
  confirmPassword: string;
}): ValidationResult<'newPassword' | 'confirmPassword'> {
  const errors: Partial<Record<'newPassword' | 'confirmPassword', string>> = {};

  const pwError = validateStrongPassword(values.newPassword);
  if (pwError) {
    errors.newPassword = pwError;
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = 'Please confirm your new password.';
  } else if (values.newPassword !== values.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateChangePasswordForm(values: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}): ValidationResult<'currentPassword' | 'newPassword' | 'confirmPassword'> {
  const errors: Partial<
    Record<'currentPassword' | 'newPassword' | 'confirmPassword', string>
  > = {};

  if (!values.currentPassword) {
    errors.currentPassword = 'Current password is required.';
  }

  const pwError = validateStrongPassword(values.newPassword);
  if (pwError) {
    errors.newPassword = pwError;
  } else if (values.currentPassword === values.newPassword) {
    errors.newPassword = 'New password must differ from your current password.';
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = 'Please confirm your new password.';
  } else if (values.newPassword !== values.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function isValidHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function validateProfileDetailsForm(values: {
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  location: string;
}): ValidationResult<'username' | 'displayName' | 'bio' | 'avatarUrl' | 'location'> {
  const errors: Partial<
    Record<'username' | 'displayName' | 'bio' | 'avatarUrl' | 'location', string>
  > = {};

  const normalizedUsername = values.username.trim().toLowerCase();
  if (!normalizedUsername) {
    errors.username = 'Username is required.';
  } else if (!USERNAME_PATTERN.test(normalizedUsername)) {
    errors.username =
      'Use 3–30 lowercase letters, numbers, or underscores only.';
  }

  const displayName = values.displayName.trim();
  if (!displayName) {
    errors.displayName = 'Display name is required.';
  } else if (displayName.length < 2) {
    errors.displayName = 'Display name must be at least 2 characters.';
  } else if (displayName.length > 100) {
    errors.displayName = 'Display name must not exceed 100 characters.';
  }

  if (values.bio.trim().length > 500) {
    errors.bio = 'Bio must not exceed 500 characters.';
  }

  if (values.location.trim().length > 120) {
    errors.location = 'Location must not exceed 120 characters.';
  }

  const avatar = values.avatarUrl.trim();
  if (avatar && !isValidHttpUrl(avatar)) {
    errors.avatarUrl = 'Avatar URL must begin with http:// or https://.';
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
