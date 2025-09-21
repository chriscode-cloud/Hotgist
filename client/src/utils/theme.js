import { DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#FF6B35',
    accent: '#F7931E',
    background: '#FFFFFF',
    surface: '#F5F5F5',
    text: '#333333',
    placeholder: '#999999',
    backdrop: 'rgba(0, 0, 0, 0.5)',
  },
  roundness: 12,
};

export const colors = {
  primary: '#FF6B35',
  secondary: '#F7931E',
  background: '#FFFFFF',
  surface: '#F5F5F5',
  text: '#333333',
  textSecondary: '#666666',
  placeholder: '#999999',
  border: '#E0E0E0',
  error: '#FF5252',
  success: '#4CAF50',
  warning: '#FF9800',
  info: '#2196F3',
  white: '#FFFFFF',
  black: '#000000',
  gray: '#9E9E9E',
  lightGray: '#F5F5F5',
  darkGray: '#424242',
};
