import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { useColorScheme } from 'react-native';

const baseColors = {
  primary: '#1565C0',
  secondary: '#0288D1',
};

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: baseColors.primary,
    secondary: baseColors.secondary,
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#90CAF9',
    secondary: '#4FC3F7',
  },
};

// Default export used in root layout — responds to system color scheme
// The PaperProvider handles theme switching via useColorScheme internally
export const theme = lightTheme;
