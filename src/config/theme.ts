import { MD3LightTheme, configureFonts, MD3Theme } from 'react-native-paper';
import { Platform } from 'react-native';

/**
 * Base font style for the app, used as a foundation for all typography variants.
 */
const baseFont = {
  fontFamily: Platform.select({ ios: 'System', android: 'sans-serif' }),
  fontSize: 14,
  lineHeight: 20,
  letterSpacing: 0.25,
};

/**
 * FontWeight type for MD3 font configuration.
 */
type FontWeight = 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';

/**
 * Font configuration for Material Design 3 (MD3) typography variants.
 */
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

  // Additional variants for custom weights and cross-platform consistency
  regular: { ...baseFont, fontFamily: Platform.select({ ios: 'System', android: 'sans-serif' }), fontWeight: 'normal' as FontWeight },
  medium: { ...baseFont, fontFamily: Platform.select({ ios: 'System', android: 'sans-serif-medium' }), fontWeight: '500' as FontWeight },
  light: { ...baseFont, fontFamily: Platform.select({ ios: 'System', android: 'sans-serif-light' }), fontWeight: '300' as FontWeight },
  thin: { ...baseFont, fontFamily: Platform.select({ ios: 'System', android: 'sans-serif-thin' }), fontWeight: '100' as FontWeight },
};

/**
 * Type for custom theme colors, extending MD3Theme colors.
 */
type AppThemeColors = MD3Theme['colors'] & {
  brandPurple: string;
  brandLavender: string;
  brandDarkPurple: string;
  gradientCardDefault: string[];
  gradientPasswordCard: string[];
  gradientWeb3KeyCard: string[];
  gold: string;
  elevation: {
    level0: string;
    level1: string;
    level2: string;
    level3: string;
    level4: string;
    level5: string;
  };
};

/**
 * AppThemeType interface, extends MD3Theme and adds custom properties.
 */
export interface AppThemeType extends MD3Theme {
  colors: AppThemeColors;
}

/**
 * Light theme configuration for the app, extending MD3LightTheme.
 * Includes custom colors and elevation levels.
 */
export const appTheme: AppThemeType = {
  ...MD3LightTheme,
  roundness: 12,
  version: 3,
  isV3: true,
  colors: {
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
    outlineVariant: '#EDE9FE',
    scrim: '#000000',
     
    
    // Custom brand colors
    brandPurple: '#8B5CF6',
    brandLavender: '#C4B5FD',
    brandDarkPurple: '#5B21B6',
    
    // Gradient arrays
    gradientCardDefault: ['#2C2838', '#4A4458'],
    gradientPasswordCard: ['#8B5CF6', '#6D28D9'],
    gradientWeb3KeyCard: ['#A78BFA', '#8B5CF6'],
    
    // Gold color variants
    gold: '#daa520',
    
    elevation: {
      level0: 'transparent',
      level1: '#F5F3FF',
      level2: '#EDE9FE',
      level3: '#C4B5FD',
      level4: '#A78BFA',
      level5: '#8B5CF6',
    },
  },
  fonts: configureFonts({ config: fontConfig, isV3: true }),
};







