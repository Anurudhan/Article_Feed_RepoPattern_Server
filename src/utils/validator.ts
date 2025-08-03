

export function validateEmail(email: string): boolean {
  const trimmedEmail = email.trim();

  // Check if empty or only spaces
  if (!trimmedEmail) return false;

  // Simple email regex pattern
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(trimmedEmail);
}

export function validatePhone(phone: string): boolean {
  const trimmedPhone = phone.trim();

  // Check if empty or contains only spaces
  if (!trimmedPhone) return false;

  // Check if it's all digits and 10 characters long
  const phoneRegex = /^\d{10}$/;
  return phoneRegex.test(trimmedPhone);
}
