

import 'react-native-get-random-values'; // For crypto.randomUUID
import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { AppDataProvider } from './src/contexts/AppDataContext';
import AppNavigator from './src/navigation/AppNavigator';
// Fix: appTheme will be correctly typed as MD3Theme with custom extensions.
import { appTheme } from './src/config/theme';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  return (
    <SafeAreaProvider>
      {/* Fix: Ensure appTheme is a valid MD3Theme. Primary fix in src/config/theme.ts */}
      {/* The appTheme is now correctly typed to be compatible with PaperProvider's theme prop. */}
      <PaperProvider theme={appTheme}>
        <AppDataProvider>
          <AppNavigator />
          {/* Fix: Property 'background' does now exist on type 'AppColors' after theme.ts changes. */}
          <StatusBar style="light" backgroundColor={appTheme.colors.background} />
        </AppDataProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}