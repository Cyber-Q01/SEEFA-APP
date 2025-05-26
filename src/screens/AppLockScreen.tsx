
import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Alert, ScrollView, Image, KeyboardAvoidingView, Platform } from 'react-native';
// Fix: Removed unused 'Theme' import from react-native-paper
import { TextInput, Button, Text, useTheme, HelperText, ActivityIndicator } from 'react-native-paper';
// Fix: useAppContext will be exported from AppDataContext.tsx
import { useAppContext } from '../contexts/AppDataContext';
import { APP_NAME } from '../config/constants';
import { useFocusEffect } from '@react-navigation/native';
import { AppThemeType } from '../config/theme'; // Import AppThemeType


// Function to create styles with theme access
const makeStyles = (theme: AppThemeType) => StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  innerContainer: {
     padding: 24,
  },
  logo: {
    width: 80, // Adjusted size
    height: 80,
    alignSelf: 'center',
    marginBottom: 24, // Adjusted spacing
  },
  title: {
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  input: {
    marginTop: 12,
  },
  errorText: {
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
  },
  button: {
    marginTop: 20,
    borderRadius: theme.roundness * 2,
  },
  buttonLabel: {
    paddingVertical: 6,
    fontWeight: 'bold',
  },
  orText: {
    textAlign: 'center',
    marginVertical: 20, // Increased spacing
    fontSize: 16,
    fontWeight: '600',
  }
});


const AppLockScreen: React.FC = () => {
  const theme = useTheme<AppThemeType>();
  const styles = makeStyles(theme); // Create styles with theme
  const { 
    unlockApp, 
    isLoading: contextIsLoading, 
    isBiometricsSupported, 
    isBiometricsEnabled,
    checkBiometricsAndUnlock 
} = useAppContext();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [unlockAttempting, setUnlockAttempting] = useState(false); // Specific for this screen's attempts

  // Attempt biometric unlock automatically when screen is focused, if enabled
  useFocusEffect(
    useCallback(() => {
      let isActive = true; // Prevent state updates if component is unmounted

      const attemptBiometric = async () => {
        if (isBiometricsEnabled && isBiometricsSupported && isActive) {
          setUnlockAttempting(true);
          const success = await checkBiometricsAndUnlock();
          if (isActive) {
            setUnlockAttempting(false);
            if (!success) {
              // Don't show error if user simply cancels biometrics.
              // An error might be shown by checkBiometricsAndUnlock for actual failures.
            }
          }
        }
      };

      attemptBiometric();
      
      return () => {
        isActive = false;
      };
    }, [isBiometricsEnabled, isBiometricsSupported, checkBiometricsAndUnlock])
  );

  const handlePasswordUnlock = async () => {
    setError(null);
    if (!password) {
      setError("Master password is required.");
      return;
    }
    setUnlockAttempting(true);
    const success = await unlockApp(password);
    setUnlockAttempting(false);
    if (!success) {
      setError("Invalid master password. Please try again.");
      setPassword(''); 
    }
    // Successful unlock will trigger navigation change via AppNavigator due to context update
  };
  
  const handleBiometricUnlockManual = async () => {
    setError(null);
    setUnlockAttempting(true);
    const success = await checkBiometricsAndUnlock();
    setUnlockAttempting(false);
    if (!success) {
      // User might have cancelled, or it might have failed. 
      // Allow them to try password.
    }
  };


  return (
    <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        // Fix: Color property will be valid after theme.ts fixes.
        style={{ flex: 1, backgroundColor: theme.colors.background }}
    >
    <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
    >
      <View style={styles.innerContainer}>
      {/* You can add your app logo here */}
      {/* <Image source={require('../../assets/icon.png')} style={styles.logo} /> */}
      {/* Fix: Color property will be valid after theme.ts fixes. */}
      <Text variant="headlineLarge" style={[styles.title, { color: theme.colors.primary }]}>{APP_NAME} is Locked</Text>
      {/* Fix: Color property will be valid after theme.ts fixes. */}
      <Text variant="titleMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
        {isBiometricsEnabled && isBiometricsSupported ? "Use biometrics or enter your master password." : "Enter your master password to unlock."}
      </Text>

      <TextInput
        label="Master Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
        mode="outlined"
        error={!!error}
        onSubmitEditing={handlePasswordUnlock} 
        disabled={unlockAttempting || contextIsLoading}
        autoFocus={!(isBiometricsEnabled && isBiometricsSupported)} // Autofocus if no biometrics available initially
      />
      {error && <HelperText type="error" visible={!!error} style={styles.errorText}>{error}</HelperText>}

      <Button
        mode="contained"
        onPress={handlePasswordUnlock}
        loading={unlockAttempting && !contextIsLoading} // Show loading specific to this button press
        disabled={unlockAttempting || contextIsLoading || !password}
        style={styles.button}
        labelStyle={styles.buttonLabel}
      >
        Unlock with Password
      </Button>

      {isBiometricsSupported && isBiometricsEnabled && (
        <>
          {/* Fix: Color property will be valid after theme.ts fixes. */}
          <Text style={[styles.orText, {color: theme.colors.onSurfaceVariant}]}>OR</Text>
          <Button
            mode="outlined"
            icon="fingerprint"
            onPress={handleBiometricUnlockManual}
            disabled={unlockAttempting || contextIsLoading}
            // Fix: Color properties will be valid after theme.ts fixes.
            style={[styles.button, {borderColor: theme.colors.primary}]}
            labelStyle={[styles.buttonLabel, {color: theme.colors.primary}]}
          >
            Unlock with Biometrics
          </Button>
        </>
      )}
      {/* Fix: Color property will be valid after theme.ts fixes. */}
      {(unlockAttempting || contextIsLoading) && <ActivityIndicator animating={true} style={{marginTop: 20}} color={theme.colors.primary}/>}
      </View>
    </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default AppLockScreen;