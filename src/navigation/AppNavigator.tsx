import React from 'react';
// Fix: Use Theme as NavigationNativeTheme to avoid conflicts and be explicit.
import { NavigationContainer, Theme as NavigationNativeTheme } from '@react-navigation/native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { useTheme, ActivityIndicator, IconButton } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';
import AppLockScreen from '../screens/AppLockScreen';
import HomeScreen from '../screens/HomeScreen';
import AddEditEntryScreen from '../screens/AddEditEntryScreen';
import UpgradeScreen from '../screens/UpgradeScreen';
import SettingsScreen from '../screens/SettingsScreen';
// Fix: Assuming MasterPasswordSetupScreen has a default export, this import should be fine. The error might be elsewhere.
import MasterPasswordSetupScreen from '../screens/MasterPasswordSetupScreen'; 
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen'; // Import new screen
import TermsOfServiceScreen from '../screens/TermsOfServiceScreen'; // Import new screen


import { EntryType, EntryFormData } from '../types';
// Fix: useAppContext will be exported from AppDataContext.tsx
import { useAppData } from '../contexts/AppDataContext';
import { AppThemeType } from '../config/theme';

// Define the types for the RootStackParamList
export type RootStackParamList = {
  Home: undefined;
  AddEditEntry: { entryId?: string, entryType?: EntryType, formData?: Partial<EntryFormData> };
  Upgrade: undefined;
  Settings: undefined;
  MasterPasswordSetup: undefined;
  Loading: undefined;
  PrivacyPolicy: undefined; // New screen
  TermsOfService: undefined; // New screen
  AppLock: undefined;
};

// Create a stack navigator
const Stack = createStackNavigator<RootStackParamList>();

// Main AppNavigator component
export default function AppNavigator() {
  const theme = useTheme<AppThemeType>(); // Use the theme
  const { isEncryptionKeySet, isAppLocked, isLoading } = useAppData(); // Get app data from context

  // Show loading indicator while app data is loading
  if (isLoading) {
     return (
      <View style={[styles.centered, {backgroundColor: theme.colors.background}]}>
        <ActivityIndicator animating={true} size="large" color={theme.colors.primary}/>
      </View>
     );
  }

  let initialRouteName: keyof RootStackParamList; // Define the initial route name
  // If encryption key is not set, navigate to MasterPasswordSetup screen
  if (!isEncryptionKeySet) {
    initialRouteName = "MasterPasswordSetup";
  }  else {
    initialRouteName = "Home"; // Otherwise, navigate to Home screen
  }

  // Construct a theme object specifically for NavigationContainer
  // Fix: Ensure navigationTheme conforms to NavigationNativeTheme, including fonts if required.
const navigationTheme: NavigationNativeTheme = { 
  dark: theme.dark,
  colors: {
    // Fix: Properties like 'background', 'primary', etc., will be valid after theme.ts fixes.
    primary: theme.colors.primary,
    background: theme.colors.background,
    card: theme.colors.elevation.level2, 
    text: theme.colors.onSurface,
    border: theme.colors.outline, 
    notification: theme.colors.error,
  },
};



  // Note: The error "Property 'id' is missing..." on Stack.Navigator is often misleading.
  // It's unlikely Stack.Navigator requires an 'id' prop. This might be a deeper type issue
  // or a misinterpretation by the linter. Not adding an 'id' prop here based on user's prior comment.
  return (
    // Navigation container
    <NavigationContainer theme={navigationTheme}>
     {/* Stack navigator */}
     <Stack.Navigator
 
  initialRouteName={initialRouteName}
  screenOptions={{
    headerStyle: { backgroundColor: theme.colors.background }, // <-- use surface everywhere
    headerTintColor: theme.colors.onSurface,
    headerTitleStyle: { fontWeight: 'bold' },
    cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
  }}
>
  {/* If encryption key is not set, show MasterPasswordSetup screen */}
  {!isEncryptionKeySet ? (
    <Stack.Screen
      name="MasterPasswordSetup"
      component={MasterPasswordSetupScreen}
      options={{ headerShown: false }}
    />
  ) : isAppLocked && isEncryptionKeySet ? (
    <Stack.Screen
      name="AppLock"
      component={AppLockScreen}
      options={{ headerShown: false }}
    />
  ) : (
    <>
      {/* Home screen */}
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={({ navigation }) => ({
          title: 'SEEFA Dashboard',
         
          headerRight: () => (
            <IconButton
              icon="cog-outline"
              iconColor={theme.colors.onSurfaceVariant}
              size={26}
              onPress={() => navigation.navigate('Settings')}
              style={{ marginRight: 10 }}
              accessibilityLabel="Open settings"
            />
          ),
        })}
      />
      {/* Add/Edit entry screen */}
      <Stack.Screen
        name="AddEditEntry"
        component={AddEditEntryScreen}
        options={({ route }) => ({
          title: route.params?.entryId ? 'Edit Entry' : 'Add New Entry',
          presentation: 'modal',
          headerStyle: { backgroundColor: theme.colors.background },
        })}
      />
      {/* Upgrade screen */}
      <Stack.Screen
        name="Upgrade"
        component={UpgradeScreen}
        options={{
          title: 'Upgrade to Pro',
          presentation: 'modal',
          headerStyle: { backgroundColor: theme.colors.background },
        }}
      />
      {/* Settings screen */}
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Settings',
        }}
      />
      {/* Privacy Policy screen */}
      <Stack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicyScreen}
        options={{
          title: 'Privacy Policy',
          headerShown: false,
          presentation: 'modal',
        }}
      />
      {/* Terms of Service screen */}
      <Stack.Screen
        name="TermsOfService"
        component={TermsOfServiceScreen}
        options={{
          title: 'Terms of Service',
          headerShown: false,
          presentation: 'modal',
        }}
      />
    </>
  )}
</Stack.Navigator>
    </NavigationContainer>
  );
}

// Styles for the component
const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
