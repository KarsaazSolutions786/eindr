import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Updated color palette based on the provided image
export const colors = {
  // Core Palette
  primaryDark: '#16182A', // Deep dark blue/purple
  accentLight: '#A6A1F6', // Light lavender (60% opacity)
  accentStroke: '#B2A1FF', // Stroke lavender
  white: '#FFFFFF',
  black: '#000000',
  transparentBlack20: 'rgba(0, 0, 0, 0.2)', // Black with 20% opacity
  transparentAccentLight60: 'rgba(166, 161, 246, 0.6)', // #A6A1F6 with 60% opacity

  // Semantic Colors (can be mapped to core palette)
  primary: '#B2A1FF', // Using accentStroke as primary for now
  secondary: '#A6A1F6', // Using accentLight as secondary
  background: {
    primary: '#16182A', // Dark background
    secondary: '#2C2C54', // Slightly lighter dark bg (from input example)
    tertiary: '#4C4C7A', // Even lighter dark bg (from input example)
    transparent: null,
  },
  text: {
    primary: '#FFFFFF', // White text on dark background
    secondary: '#A8A8D0', // Light lavender/gray text (from input example)
    tertiary: '#8E8E93', // Keeping a gray for less emphasis
    link: '#B2A1FF', // Link color
    placeholder: '#FFFFFF', // Placeholder text color
  },
  border: {
    primary: '#4C4C7A', // Default border (from input example)
    secondary: '#B2A1FF', // Accent border
  },

  // Status Colors (standard)
  success: '#34C759',
  danger: '#FF3B30',
  warning: '#FF9500',
  info: '#5AC8FA',

  // Original Grays (kept for utility if needed)
  gray: {
    100: '#F2F2F7',
    200: '#E5E5EA',
    300: '#D1D1D6',
    400: '#C7C7CC',
    500: '#AEAEB2',
    600: '#8E8E93',
    700: '#636366',
    800: '#48484A',
    900: '#3A3A3C',
  },
};

// Updated typography based on the provided image
export const typography = {
  fontFamily: {
    // NOTE: Ensure these font files (Poppins-Regular, Poppins-Medium, Poppins-SemiBold)
    // are added to your project assets and linked correctly.
    regular: 'Poppins-Regular',
    medium: 'Poppins-Medium',
    bold: 'Poppins-SemiBold', // Using SemiBold as bold based on image
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18, // Matches 18px Medium from image
    xl: 20, // Matches 20px Medium from image
    '2xl': 24,
    '3xl': 30, // Matches 30px Semi Bold from image
    '4xl': 36,
    '6xl': 50,
  },
  // Line heights can be adjusted based on font specifics if needed
  lineHeight: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 28,
    xl: 32,
    '2xl': 36,
    '3xl': 40,
    '4xl': 48,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 40,
  '3xl': 48,
  '4xl': 56,
};

export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
};

export const layout = {
  screenWidth: width,
  screenHeight: height,
  isSmallDevice: width < 375,
};

// Linear gradient backgrounds
export const gradients = {
  // Main app background - dark purple to deeper purple
  primary: {
    colors: ['#292C4A', '#16182A'],
    locations: [0, 1],
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
  // Secondary gradient - purple accent to dark
  secondary: {
    colors: ['#A6A1F6', '#7067CF'],
    locations: [0, 1],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  // Button gradient
  button: {
    colors: ['#B2A1FF', '#8369F0'],
    locations: [0, 1],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
  },
  // Card background
  card: {
    colors: ['rgba(45, 47, 70, 0.8)', 'rgba(35, 37, 60, 0.9)'],
    locations: [0, 1],
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
};

export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  layout,
  gradients,
};

export type Theme = typeof theme;
export default theme;
