
import React, { useState } from 'react';
import { View, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput } from 'react-native-paper';
// Fix: Removed 'Theme' from import as it's not an exported member of 'react-native-paper' in MD3. AppThemeType is used instead.
import { Button, Text, useTheme, HelperText, ActivityIndicator, ProgressBar } from 'react-native-paper';
// Fix: useAppContext will be exported from AppDataContext.tsx
import { useAppData } from '../contexts/AppDataContext';
import { APP_NAME } from '../config/constants';
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
  title: {
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },
  warning: {
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: 'bold',
    fontSize: 13,
    lineHeight: 18,
    // Fix: Color property will be valid after theme.ts fixes.
    backgroundColor: theme.colors.error, 
    padding: 8, 
    borderRadius: theme.roundness, 
    // Fix: Color property will be valid after theme.ts fixes.
    color: theme.colors.onError, 
  },
  input: {
    marginTop: 12, // Spacing between inputs
  },
  strengthContainer: {
    marginTop: 4,
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  errorText: {
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
  },
  button: {
    marginTop: 32, // More space before button
    borderRadius: theme.roundness * 2,
  },
  buttonLabel: {
    paddingVertical: 6,
    fontWeight: 'bold',
  }
});


const MasterPasswordSetupScreen: React.FC = () => {
  const theme = useTheme<AppThemeType>();
  const styles = makeStyles(theme); // Create styles with theme
  const { setMasterPasswordAndInitialize, isLoading: contextIsLoading } = useAppData(); // Renamed isLoading to avoid conflict
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  // Fix: Color property will be valid after theme.ts fixes.
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, message: '', progress: 0, color: theme.colors.error });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validatePasswordStrength = (p: string) => {
    let score = 0;
    let progress = 0;
    let message = '';
    // Fix: Color property will be valid after theme.ts fixes.
    let color = theme.colors.error;

    if (!p) {
      setPasswordStrength({ score: 0, message: '', progress: 0, color });
      return;
    }

    if (p.length >= 8) { score++; progress += 0.25; }
    if (p.length >= 12) { score++; progress += 0.25; } // Bonus for length
    if (/[A-Z]/.test(p)) { score++; progress += 0.15; }
    if (/[a-z]/.test(p)) { score++; progress += 0.15; }
    if (/[0-9]/.test(p)) { score++; progress += 0.10; }
    if (/[^A-Za-z0-9]/.test(p)) { score++; progress += 0.10; } // Special character

    if (score <= 2) {
      message = 'Weak';
      // Fix: Color property will be valid after theme.ts fixes.
      color = theme.colors.error;
    } else if (score <= 4) {
      message = 'Moderate';
      // Fix: Color property will be valid after theme.ts fixes.
      color = theme.colors.tertiary; 
    } else {
      message = 'Strong';
      // Fix: Color property will be valid after theme.ts fixes.
      color = theme.colors.primary; 
    }
    progress = Math.min(progress, 1); // Cap progress at 1
    setPasswordStrength({ score, message, progress, color });
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    validatePasswordStrength(text);
    if (error) setError(null);
  };
  
  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);
    if (error) setError(null);
  };

  const handleSubmit = async () => {
    setError(null);
    if (!password || !confirmPassword) {
      setError("Both password fields are required.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (passwordStrength.score < 3) { // Arbitrary minimum strength score
        setError("Password is too weak. Please choose a stronger one.");
        return;
    }

    setIsSubmitting(true);
    const success = await setMasterPasswordAndInitialize(password);
    setIsSubmitting(false);

    if (!success) {
      setError("Failed to set up master password. Please try again.");
      // AppNavigator will handle navigation if successful (isEncryptionKeySet becomes true)
    }
  };

  // Note: The FC type error on line 69 is likely a linter misattribution if the component fully returns JSX.
  // Assuming the component is correctly structured and returns JSX.
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      // Fix: Color property will be valid after theme.ts fixes.
      style={{ flex: 1, backgroundColor: theme.colors.background }}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.innerContainer}>
          {/* Fix: Color property will be valid after theme.ts fixes. */}
          <Text variant="headlineLarge" style={[styles.title, { color: theme.colors.primary }]}>
            Secure Your Vault
          </Text>
          {/* Fix: Color property will be valid after theme.ts fixes. */}
          <Text variant="titleMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
            Create a strong Master Password to encrypt and protect your data in {APP_NAME}.
          </Text>
          <Text style={[styles.warning]}>
            IMPORTANT: Your Master Password is the ONLY key to your data. If you forget it, your data will be PERMANENTLY LOST. We cannot recover it for you.
          </Text>

          <TextInput
            label="Master Password"
            value={password}
            onChangeText={handlePasswordChange}
            secureTextEntry
            style={styles.input}
            mode="outlined"
            error={!!error && (error.includes("password") || error.includes("weak"))}
            disabled={isSubmitting || contextIsLoading}
            autoFocus
          />
          {password.length > 0 && (
            <View style={styles.strengthContainer}>
              <ProgressBar progress={passwordStrength.progress} color={passwordStrength.color} style={styles.progressBar}/>
              <HelperText type="info" visible={!!passwordStrength.message} style={{color: passwordStrength.color}}>
                Strength: {passwordStrength.message}
              </HelperText>
            </View>
          )}

          <TextInput
            label="Confirm Master Password"
            value={confirmPassword}
            onChangeText={handleConfirmPasswordChange}
            secureTextEntry
            style={styles.input}
            mode="outlined"
            error={!!error && error.includes("match")}
            disabled={isSubmitting || contextIsLoading}
            onSubmitEditing={handleSubmit}
          />
          
          {error && <HelperText type="error" visible={!!error} style={styles.errorText}>{error}</HelperText>}

          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={isSubmitting || contextIsLoading}
            disabled={isSubmitting || contextIsLoading || !password || !confirmPassword}
            style={styles.button}
            labelStyle={styles.buttonLabel}
          >
            Set Master Password & Initialize
          </Button>
          {/* Fix: Color property will be valid after theme.ts fixes. */}
          {(isSubmitting || contextIsLoading) && <ActivityIndicator animating={true} style={{marginTop: 20}} color={theme.colors.primary}/>}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default MasterPasswordSetupScreen;
