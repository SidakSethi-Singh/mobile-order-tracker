import { Platform } from 'react-native';

export const Colors = {
  light: {
    primary: '#6366f1', // Indigo
    primaryLight: '#e0e7ff',
    background: '#f8fafc', // Slate 50
    card: '#ffffff',
    cardBorder: '#e2e8f0', // Slate 200
    text: '#0f172a', // Slate 900
    textSecondary: '#64748b', // Slate 500
    textMuted: '#94a3b8', // Slate 400
    accent: '#f59e0b', // Amber 500
    
    // Status colors
    processing: '#f59e0b', // Amber
    shipped: '#3b82f6', // Blue
    outForDelivery: '#8b5cf6', // Purple
    delivered: '#10b981', // Emerald
    cancelled: '#ef4444', // Red
    
    backgroundElement: '#f1f5f9',
    backgroundSelected: '#e2e8f0',
  },
  dark: {
    primary: '#818cf8', // Indigo 400
    primaryLight: '#1e1b4b', // Indigo 950
    background: '#0b0f19', // Premium Dark Slate
    card: '#151f32', // Dark Slate Blue card
    cardBorder: '#1e293b', // Slate 800
    text: '#f8fafc', // Slate 50
    textSecondary: '#94a3b8', // Slate 400
    textMuted: '#64748b', // Slate 500
    accent: '#fbbf24', // Amber 400
    
    // Status colors
    processing: '#fbbf24',
    shipped: '#60a5fa',
    outForDelivery: '#a78bfa',
    delivered: '#34d399',
    cancelled: '#f87171',
    
    backgroundElement: '#1e293b',
    backgroundSelected: '#334155',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'System',
    serif: 'Georgia',
    rounded: 'System',
    mono: 'Courier New',
  },
  default: {
    sans: 'sans-serif',
    serif: 'serif',
    rounded: 'sans-serif',
    mono: 'monospace',
  },
  web: {
    sans: 'Inter, system-ui, sans-serif',
    serif: 'Georgia, serif',
    rounded: 'system-ui, sans-serif',
    mono: 'monospace',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Shadows = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  android: {
    elevation: 4,
  },
  web: {
    boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.1), 0 2px 8px -1px rgba(0, 0, 0, 0.06)',
  },
}) ?? {};

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
