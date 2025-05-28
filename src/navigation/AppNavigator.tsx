
import React from 'react';
// Fix: Use Theme as NavigationNativeTheme to avoid conflicts and be explicit.
import { NavigationContainer, Theme as NavigationNativeTheme } from '@react-navigation/native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { useTheme, ActivityIndicator, IconButton } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';

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

export type RootStackParamList = {
  Home: undefined;
  AddEditEntry: { entryId?: string, entryType?: EntryType, formData?: Partial<EntryFormData> };
  Upgrade: undefined;
  Settings: undefined;
  MasterPasswordSetup: undefined;
  Loading: undefined;
  PrivacyPolicy: undefined; // New screen
  TermsOfService: undefined; // New screen
};

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const theme = useTheme<AppThemeType>();
  const { isEncryptionKeySet, isAppLocked, isLoading } = useAppData();

  if (isLoading) {
     return (
      <View style={[styles.centered, {backgroundColor: theme.colors.background}]}>
        <ActivityIndicator animating={true} size="large" color={theme.colors.primary}/>
      </View>
     );
  }

  let initialRouteName: keyof RootStackParamList;
  if (!isEncryptionKeySet) {
    initialRouteName = "MasterPasswordSetup";
  }  else {
    initialRouteName = "Home";
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
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        initialRouteName={initialRouteName}
        screenOptions={{
          // Fix: Color properties will be valid after theme.ts fixes.
          headerStyle: { backgroundColor: theme.colors.elevation.level2 },
          headerTintColor: theme.colors.onSurface,
          headerTitleStyle: { fontWeight: 'bold' },
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      >
        {!isEncryptionKeySet ? (
          <Stack.Screen
            name="MasterPasswordSetup"
            component={MasterPasswordSetupScreen}
            options={{ title: 'Setup Security', headerShown: false }}
          />
        ) : (
          <>
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={({ navigation }) => ({
                title: 'SEEFA Dashboard',
                headerRight: () => (
                  <IconButton
                    icon="cog-outline"
                    // Fix: Color property will be valid after theme.ts fixes.
                    iconColor={theme.colors.onSurfaceVariant}
                    size={26}
                    onPress={() => navigation.navigate('Settings')}
                    style={{ marginRight: 10 }}
                    accessibilityLabel="Open settings"
                  />
                ),
              })}
            />
            <Stack.Screen
              name="AddEditEntry"
              component={AddEditEntryScreen}
              options={({ route }) => ({
                title: route.params?.entryId ? 'Edit Entry' : 'Add New Entry',
                presentation: 'modal',
                // Fix: Color property will be valid after theme.ts fixes.
                headerStyle: { backgroundColor: theme.colors.background },
              })}
            />
            <Stack.Screen
                name="Upgrade"
                component={UpgradeScreen}
                options={{
                    title: 'Upgrade to Pro',
                    presentation: 'modal',
                    // Fix: Color property will be valid after theme.ts fixes.
                    headerStyle: { backgroundColor: theme.colors.background },
                }}
            />
            <Stack.Screen
                name="Settings"
                component={SettingsScreen}
                options={{
                    title: 'Settings',
                }}
            />
            <Stack.Screen
                name="PrivacyPolicy"
                component={PrivacyPolicyScreen}
                options={{
                    title: 'Privacy Policy',
                    headerShown: false, // Custom header in screen
                    presentation: 'modal',
                }}
            />
            <Stack.Screen
                name="TermsOfService"
                component={TermsOfServiceScreen}
                options={{
                    title: 'Terms of Service',
                    headerShown: false, // Custom header in screen
                    presentation: 'modal',
                }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
