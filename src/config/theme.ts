import { MD3LightTheme, configureFonts, MD3Theme } from 'react-native-paper';
import { Platform } from 'react-native';

// Define a base font style that includes all required MD3 properties
const baseFont = {
  fontFamily: Platform.select({ ios: 'System', android: 'sans-serif' }),
  fontSize: 14,
  lineHeight: 20,
  letterSpacing: 0.25,
};

// Define specific font weights as literal types for MD3
type FontWeight = 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';

const fontConfig = {
  displayLarge: { ...baseFont, fontWeight: '400' as FontWeight, fontSize: 57, lineHeight: 64, letterSpacing: -0.25 },
  displayMedium: { ...baseFont, fontWeight: '400' as FontWeight, fontSize: 45, lineHeight: 52, letterSpacing: 0 },
  displaySmall: { ...baseFont, fontWeight: '400' as FontWeight, fontSize: 36, lineHeight: 44, letterSpacing: 0 },

  headlineLarge: { ...baseFont, fontWeight: '400' as FontWeight, fontSize: 32, lineHeight: 40, letterSpacing: 0 },
  headlineMedium: { ...baseFont, fontWeight: '400' as FontWeight, fontSize: 28, lineHeight: 36, letterSpacing: 0 },
  headlineSmall: { ...baseFont, fontWeight: '400' as FontWeight, fontSize: 24, lineHeight: 32, letterSpacing: 0 },

  titleLarge: { ...baseFont, fontWeight: '400' as FontWeight, fontSize: 22, lineHeight: 28, letterSpacing: 0 },
  titleMedium: { ...baseFont, fontWeight: '500' as FontWeight, fontSize: 16, lineHeight: 24, letterSpacing: 0.15 },
  titleSmall: { ...baseFont, fontWeight: '500' as FontWeight, fontSize: 14, lineHeight: 20, letterSpacing: 0.1 },

  labelLarge: { ...baseFont, fontWeight: '500' as FontWeight, fontSize: 14, lineHeight: 20, letterSpacing: 0.1 },
  labelMedium: { ...baseFont, fontWeight: '500' as FontWeight, fontSize: 12, lineHeight: 16, letterSpacing: 0.5 },
  labelSmall: { ...baseFont, fontWeight: '500' as FontWeight, fontSize: 11, lineHeight: 16, letterSpacing: 0.5 },

  bodyLarge: { ...baseFont, fontWeight: '400' as FontWeight, fontSize: 16, lineHeight: 24, letterSpacing: 0.5 },
  bodyMedium: { ...baseFont, fontWeight: '400' as FontWeight, fontSize: 14, lineHeight: 20, letterSpacing: 0.25 },
  bodySmall: { ...baseFont, fontWeight: '400' as FontWeight, fontSize: 12, lineHeight: 16, letterSpacing: 0.4 },

  // Default font, mapping to bodyMedium or as appropriate
  default: { ...baseFont, fontWeight: '400' as FontWeight, fontSize: 14, lineHeight: 20, letterSpacing: 0.25 },
  
  // Additional variants from original user code, mapped to MD3 structure.
  // These specific weights might need custom font loading if not standard system fonts.
  // For simplicity, using standard weights and relying on system fonts.
  // If 'System' doesn't provide 'sans-serif-medium', '500' might not render as expected on iOS.
  // Android handles 'sans-serif-medium' well.
  // For cross-platform consistency with specific weights, custom fonts via expo-font are best.
  regular: { ...baseFont, fontFamily: Platform.select({ ios: 'System', android: 'sans-serif' }), fontWeight: 'normal' as FontWeight },
  medium: { ...baseFont, fontFamily: Platform.select({ ios: 'System', android: 'sans-serif-medium' }), fontWeight: '500' as FontWeight },
  light: { ...baseFont, fontFamily: Platform.select({ ios: 'System', android: 'sans-serif-light' }), fontWeight: '300' as FontWeight },
  thin: { ...baseFont, fontFamily: Platform.select({ ios: 'System', android: 'sans-serif-thin' }), fontWeight: '100' as FontWeight },
};

export const appTheme: MD3Theme = {
  ...MD3LightTheme,
  roundness: 12,
  version: 3,
  isV3: true,
  colors: {
    primary: '#8B5CF6',
    onPrimary: '#FFFFFF',
    primaryContainer: '#C4B5FD',
    onPrimaryContainer: '#2C0058',
    secondary: '#6D28D9',
    onSecondary: '#FFFFFF',
    secondaryContainer: '#EDE9FE',
    onSecondaryContainer: '#25005A',
    tertiary: '#A78BFA',
    onTertiary: '#FFFFFF',
    tertiaryContainer: '#E0D1FF',
    onTertiaryContainer: '#21005E',
    error: '#B00020',
    onError: '#FFFFFF',
    errorContainer: '#FCD8DF',
    onErrorContainer: '#3E0013',
    background: '#1E1B26',
    onBackground: '#EAEAEA',
    surface: '#2C2838',
    onSurface: '#EAEAEA',
    surfaceVariant: '#4A4458',
    onSurfaceVariant: '#CAC4CF',
    outline: '#938F99',
    inverseOnSurface: '#1E1B26',
    inverseSurface: '#EAEAEA',
    inversePrimary: '#5B21B6',
    shadow: '#000000',
    surfaceDisabled: 'rgba(230, 225, 229, 0.12)',
    onSurfaceDisabled: 'rgba(230, 225, 229, 0.38)',
    backdrop: 'rgba(30, 27, 38, 0.4)',
    outlineVariant: '#4A4458',
    scrim: '#000000',
    elevation: {
      level0: 'transparent',
      level1: '#2C2838',
      level2: '#3B3549',
      level3: '#4A4458',
      level4: '#595367',
      level5: '#686276',
    },
  },
  fonts: configureFonts({config: fontConfig, isV3: true}),
};

type AppThemeColors = MD3Theme['colors'] & {
  brandPurple: string;
  brandLavender: string;
  brandDarkPurple: string;
  gradientCardDefault: string[];
  gradientPasswordCard: string[];
  gradientWeb3KeyCard: string[];
  elevation: {
    level2: string;
    level3: string;
  };
};

export interface AppThemeType extends MD3Theme {
  colors: AppThemeColors;
}
