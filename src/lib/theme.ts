// UniSum X — design tokens (indigo/violet, matching the native app)
export const colors = {
  brand: '#4F46E5',
  brand2: '#7C3AED',
  brandDeep: '#3730A3',
  brandTint: '#EEF0FF',
  bg: '#F5F6FB',
  card: '#FFFFFF',
  text: '#111827',
  textSec: '#6B7280',
  hairline: '#E7E8F0',
  success: '#059669',
  warn: '#D97706',
  danger: '#DC2626',
  white: '#FFFFFF',
};

export const radius = { sm: 10, md: 16, lg: 22, pill: 999 };
export const space = (n: number) => n * 4;

export function gpaColor(gpa: number) {
  if (gpa >= 3.5) return colors.success;
  if (gpa >= 2.5) return colors.brand;
  if (gpa >= 1.5) return colors.warn;
  return colors.danger;
}
export function scoreColor(s: number) {
  if (s >= 85) return colors.success;
  if (s >= 70) return colors.brand;
  if (s >= 50) return colors.warn;
  return colors.danger;
}

export const shadow = {
  shadowColor: '#000',
  shadowOpacity: 0.08,
  shadowRadius: 14,
  shadowOffset: { width: 0, height: 6 },
  elevation: 3,
};
