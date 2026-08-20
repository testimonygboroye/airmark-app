const NAME_PATTERN = /^[A-Za-z]+(-[A-Za-z]+)*$/;

export function validateName(value: string, required: boolean): string | null {
  if (!value) return required ? "This field is required" : null;
  if (!NAME_PATTERN.test(value)) {
    return "Only letters and single hyphens between words are allowed (e.g. El-rufai)";
  }
  return null;
}

/** Filters keystrokes to letters and hyphens only, then capitalizes the first letter. */
export function sanitizeNameInput(raw: string): string {
  const lettersAndHyphens = raw.replace(/[^A-Za-z-]/g, "");
  if (!lettersAndHyphens) return "";
  return lettersAndHyphens.charAt(0).toUpperCase() + lettersAndHyphens.slice(1);
}

export function validateEmail(value: string): string | null {
  if (!value) return "Email is required";
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(value) ? null : "Enter a valid email address";
}

export function validatePassword(value: string): string | null {
  if (!value) return "Password is required";
  if (value.length < 8) return "Must be at least 8 characters";
  if (!/[A-Z]/.test(value)) return "Must contain an uppercase letter";
  if (!/[a-z]/.test(value)) return "Must contain a lowercase letter";
  if (!/[0-9]/.test(value)) return "Must contain a number";
  if (!/[^A-Za-z0-9]/.test(value)) return "Must contain a special character";
  return null;
}

export function validateConfirmPassword(password: string, confirm: string): string | null {
  if (!confirm) return "Please confirm your password";
  return password === confirm ? null : "Passwords do not match";
}
