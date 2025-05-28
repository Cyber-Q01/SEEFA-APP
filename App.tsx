import 'react-native-get-random-values'; // For crypto.randomUUID
import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { AppDataProvider } from './src/contexts/AppDataContext';
import AppNavigator from './src/navigation/AppNavigator';
import { appTheme } from './src/config/theme';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={appTheme}>
        <AppDataProvider>
          <AppNavigator />
        </AppDataProvider>
        <StatusBar style="light" backgroundColor={appTheme.colors.background} />
      </PaperProvider>
    </SafeAreaProvider>
  );
}
