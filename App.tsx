import 'react-native-get-random-values';
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Provider as PaperProvider } from 'react-native-paper';
import { AppDataProvider } from './src/contexts/AppDataContext';
import AppNavigator from './src/navigation/AppNavigator';
import OnboardingScreen from './src/screens/OnboardingScreen';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useThemeMode } from './src/contexts/ThemeContext';

const ONBOARDING_KEY = 'has_seen_onboarding'; // Key to check if onboarding has been seen

// Main App component
export default function App() {
  return (
    // Provides theme context to the app
    <ThemeProvider>
      <MainApp />
    </ThemeProvider>
  );
}

// MainApp component to handle onboarding logic
function MainApp() {
  const { theme } = useThemeMode(); // Access the current theme
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null); // State to control onboarding screen visibility

  // useEffect hook to check if onboarding has been completed
  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_KEY).then((value: string | null) => {
      setShowOnboarding(value !== 'true'); // If value is not 'true', show onboarding
    });
  }, []);

  // Function to handle onboarding completion
  const handleOnboardingDone = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true'); // Set onboarding key to 'true'
    setShowOnboarding(false); // Hide onboarding screen
  };

  // If showOnboarding is null, return null (loading state)
  if (showOnboarding === null) return null; // or a splash/loading screen

  // Render the main app UI
  return (
    <PaperProvider theme={theme}>
      {/* Set status bar style and background color */}
      <StatusBar style="light" backgroundColor={theme.colors.background} />
      {/* Conditionally render OnboardingScreen or AppNavigator */}
      {showOnboarding ? (
        <OnboardingScreen onDone={handleOnboardingDone} />
      ) : (
        <AppDataProvider>
          <AppNavigator />
        </AppDataProvider>
      )}
    </PaperProvider>
  );
}
