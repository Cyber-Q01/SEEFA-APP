
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Platform, Linking } from 'react-native';
// Fix: Removed 'Theme' from import as it's not an exported member of 'react-native-paper' in MD3. AppThemeType is used instead.
import { List, Switch, Button, useTheme, Text, Divider, TextInput, ActivityIndicator, Dialog, Portal } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Constants from 'expo-constants';

// Fix: useAppContext will be exported from AppDataContext.tsx
import { useAppData } from '../contexts/AppDataContext';
import { RootStackParamList } from '../navigation/AppNavigator';
import { APP_NAME } from '../config/constants';
import { AppThemeType } from '../config/theme'; // Import AppThemeType


type SettingsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Settings'>;

// Function to create styles with theme access
const makeStyles = (theme: AppThemeType) => StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30, // Add padding at the bottom
  },
  sectionTitle: {
    fontWeight: 'bold',
    // Fix: Color property will be valid after theme.ts fixes.
    color: theme.colors.primary, 
    paddingHorizontal: 16,
    marginTop: 20, // Increased top margin
    marginBottom: 8,
  },
  listItemDescription: {
    fontSize: 12, // Smaller description text
    // Fix: Color property will be valid after theme.ts fixes.
    color: theme.colors.onSurfaceVariant,
  },
  divider: {
    // backgroundColor: theme.colors.surfaceVariant,
    // marginLeft: 16, // Indent divider slightly if icons are present
  },
});


const SettingsScreen: React.FC = () => {
  const theme = useTheme<AppThemeType>();
  const styles = makeStyles(theme); // Create styles with theme
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const { 
    lockApp, 
    isBiometricsSupported, 
    isBiometricsEnabled,
    toggleBiometrics,
    isAppLocked, // To prevent actions if app gets locked while in settings
    changeMasterPassword,
  } = useAppData();
  
  const [isToggleLoading, setIsToggleLoading] = useState(false);
  const [masterPasswordForBiometrics, setMasterPasswordForBiometrics] = useState('');
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showChangePasswordDialog, setShowChangePasswordDialog] = useState(false);
  const [currentMasterPassword, setCurrentMasterPassword] = useState('');
  const [newMasterPassword, setNewMasterPassword] = useState('');

  const handleToggleBiometricsSwitch = async (enable: boolean) => {
    if (isAppLocked) {
        Alert.alert("App Locked", "Please unlock the app to change settings.");
        return;
    }
    if (enable) { // If trying to enable biometrics
        setShowPasswordDialog(true); // Prompt for password first
    } else { // If trying to disable biometrics
        setIsToggleLoading(true);
        const success = await toggleBiometrics(false); // No password needed to disable
        setIsToggleLoading(false);
        if (success) {
            Alert.alert("Biometrics Disabled", `Biometric authentication has been disabled.`);
        } else {
            Alert.alert("Error", `Failed to disable biometric authentication.`);
        }
    }
  };

  const confirmEnableBiometrics = async () => {
    if (!masterPasswordForBiometrics) {
        Alert.alert("Password Required", "Please enter your master password.");
        return;
    }
    setShowPasswordDialog(false);
    setIsToggleLoading(true);
    const success = await toggleBiometrics(true, masterPasswordForBiometrics);
    setIsToggleLoading(false);
    setMasterPasswordForBiometrics(''); // Clear password after attempt
    if (success) {
        Alert.alert("Biometrics Enabled", `Biometric authentication has been enabled.`);
    } else {
        Alert.alert("Error", `Failed to enable biometric authentication. Please ensure your master password is correct.`);
    }
  };

  const handleChangeMasterPassword = () => {
    if (isAppLocked) {
      Alert.alert("App Locked", "Please unlock the app to change settings.");
      return;
    }
    setShowChangePasswordDialog(true);
  };

  const handleLockApp = () => {
    lockApp();
    // Navigation to AppLock screen is handled by AppNavigator based on isAppLocked state
  };
  
  // Placeholder for actual email
  const contactEmail = "support@seefa.app"; // Replace with your actual support email
  const handleContactSupport = () => {
    Linking.openURL(`mailto:${contactEmail}?subject=SEEFA App Support`).catch(err => {
        Alert.alert("Error", "Could not open email app.");
    });
  };

  return (
    <>
    <ScrollView 
        // Fix: Color property will be valid after theme.ts fixes.
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.scrollContent}
    >
      <List.Section title="Security Settings" titleStyle={styles.sectionTitle}>
        <List.Item
          title="Change Master Password"
          description="Update your main app password"
          // Fix: Color property will be valid after theme.ts fixes.
          left={props => <List.Icon {...props} icon="form-textbox-password" color={theme.colors.onSurfaceVariant}/>}
          onPress={handleChangeMasterPassword}
          disabled={isAppLocked}
          // Fix: Color property will be valid after theme.ts fixes.
          titleStyle={{color: theme.colors.onSurface}}
          descriptionStyle={styles.listItemDescription}
        />
        <Divider style={styles.divider}/>
        {isBiometricsSupported && (
          <>
            <List.Item
              title="Unlock with Biometrics"
              description={isBiometricsEnabled ? "Enabled" : "Disabled"}
              // Fix: Color properties will be valid after theme.ts fixes.
              left={props => <List.Icon {...props} icon={isBiometricsEnabled ? "fingerprint" : "fingerprint-off"} color={theme.colors.onSurfaceVariant} />}
              right={() => <Switch value={isBiometricsEnabled} onValueChange={() => handleToggleBiometricsSwitch(!isBiometricsEnabled)} disabled={isToggleLoading || isAppLocked} color={theme.colors.primary}/>}
              onPress={() => handleToggleBiometricsSwitch(!isBiometricsEnabled)} // Allow tap on item
              disabled={isAppLocked}
              // Fix: Color property will be valid after theme.ts fixes.
              titleStyle={{color: theme.colors.onSurface}}
              descriptionStyle={styles.listItemDescription}
            />
            <Divider style={styles.divider}/>
          </>
        )}
         <List.Item
          title="Lock App Now"
          description="Immediately secure the application"
          // Fix: Color properties will be valid after theme.ts fixes.
          left={props => <List.Icon {...props} icon="lock-outline" color={theme.colors.onSurfaceVariant}/>}
          onPress={handleLockApp}
          titleStyle={{color: theme.colors.onSurface}}
          descriptionStyle={styles.listItemDescription}
        />
      </List.Section>

      <List.Section title="Data Management (Future)" titleStyle={styles.sectionTitle}>
        <List.Item
          title="Export Data"
          description="Securely export your entries"
          // Fix: Color property will be valid after theme.ts fixes.
          left={props => <List.Icon {...props} icon="export-variant" color={theme.colors.onSurfaceVariant}/>}
          onPress={() => Alert.alert("Feature Not Implemented", "Secure data export is planned for a future update.")}
          disabled={isAppLocked}
          // Fix: Color property will be valid after theme.ts fixes.
          titleStyle={{color: theme.colors.onSurface}}
          descriptionStyle={styles.listItemDescription}
        />
        <Divider style={styles.divider}/>
        <List.Item
          title="Import Data"
          description="Securely import entries from a backup"
          // Fix: Color property will be valid after theme.ts fixes.
          left={props => <List.Icon {...props} icon="import" color={theme.colors.onSurfaceVariant}/>}
          onPress={() => Alert.alert("Feature Not Implemented", "Secure data import is planned for a future update.")}
          disabled={isAppLocked}
          // Fix: Color property will be valid after theme.ts fixes.
          titleStyle={{color: theme.colors.onSurface}}
          descriptionStyle={styles.listItemDescription}
        />
         <Divider style={styles.divider}/>
         <List.Item
          title="Delete All Data"
          description="Permanently erase all saved entries"
          // Fix: Color property will be valid after theme.ts fixes.
          titleStyle={{color: theme.colors.error}}
          left={props => <List.Icon {...props} icon="delete-alert-outline" color={theme.colors.error} />}
          onPress={() => Alert.alert("Feature Not Implemented", "This critical feature is planned for a future update and will require multiple confirmations.")}
          disabled={isAppLocked}
          // Fix: Color property will be valid after theme.ts fixes.
          descriptionStyle={[styles.listItemDescription, {color: theme.colors.errorContainer}]}
        />
      </List.Section>

      <List.Section title="Legal & Support" titleStyle={styles.sectionTitle}>
        <List.Item
          title="Privacy Policy"
          description="How we handle your data"
          // Fix: Color property will be valid after theme.ts fixes.
          left={props => <List.Icon {...props} icon="shield-account-outline" color={theme.colors.onSurfaceVariant}/>}
          onPress={() => navigation.navigate('PrivacyPolicy')}
          // Fix: Color property will be valid after theme.ts fixes.
          titleStyle={{color: theme.colors.onSurface}}
          descriptionStyle={styles.listItemDescription}
        />
        <Divider style={styles.divider}/>
        <List.Item
          title="Terms of Service"
          description="Rules for using SEEFA"
          // Fix: Color property will be valid after theme.ts fixes.
          left={props => <List.Icon {...props} icon="text-box-check-outline" color={theme.colors.onSurfaceVariant}/>}
          onPress={() => navigation.navigate('TermsOfService')}
          // Fix: Color property will be valid after theme.ts fixes.
          titleStyle={{color: theme.colors.onSurface}}
          descriptionStyle={styles.listItemDescription}
        />
         <Divider style={styles.divider}/>
        <List.Item
          title="Contact Support"
          description={`Email: ${contactEmail}`}
          // Fix: Color property will be valid after theme.ts fixes.
          left={props => <List.Icon {...props} icon="email-outline" color={theme.colors.onSurfaceVariant}/>}
          onPress={handleContactSupport}
          // Fix: Color property will be valid after theme.ts fixes.
          titleStyle={{color: theme.colors.onSurface}}
          descriptionStyle={styles.listItemDescription}
        />
      </List.Section>

      <List.Section title="About" titleStyle={styles.sectionTitle}>
        <List.Item
          title={`${APP_NAME} App Version`}
          description={`${Constants.expoConfig?.version || '1.0.0'}`}
          // Fix: Color property will be valid after theme.ts fixes.
          left={props => <List.Icon {...props} icon="information-outline" color={theme.colors.onSurfaceVariant}/>}
          titleStyle={{color: theme.colors.onSurface}}
          descriptionStyle={styles.listItemDescription}
        />
      </List.Section>
      {/* Fix: Color property will be valid after theme.ts fixes. */}
      {isToggleLoading && <ActivityIndicator animating={true} style={{marginVertical: 20}} color={theme.colors.primary} />}
    </ScrollView>

    <Portal>
        <Dialog visible={showPasswordDialog} onDismiss={() => { setShowPasswordDialog(false); setMasterPasswordForBiometrics(''); }}>
          {/* Fix: Color property will be valid after theme.ts fixes. */}
          <Dialog.Title style={{color: theme.colors.onSurface}}>Enable Biometric Unlock</Dialog.Title>
          <Dialog.Content>
            {/* Fix: Color property will be valid after theme.ts fixes. */}
            <Text style={{color: theme.colors.onSurfaceVariant, marginBottom:10}}>Please enter your master password to confirm and enable biometric authentication.</Text>
            <TextInput
              label="Master Password"
              value={masterPasswordForBiometrics}
              onChangeText={setMasterPasswordForBiometrics}
              secureTextEntry
              mode="outlined"
              // Fix: Color property will be valid after theme.ts fixes.
              style={{backgroundColor: theme.colors.surface}}
              autoFocus
              disabled={isToggleLoading}
            />
          </Dialog.Content>
          <Dialog.Actions>
            {/* Fix: Color properties will be valid after theme.ts fixes. */}
            <Button onPress={() => { setShowPasswordDialog(false); setMasterPasswordForBiometrics(''); }} textColor={theme.colors.onSurfaceVariant} disabled={isToggleLoading}>Cancel</Button>
            <Button onPress={confirmEnableBiometrics} loading={isToggleLoading} disabled={!masterPasswordForBiometrics || isToggleLoading} textColor={theme.colors.primary}>Confirm & Enable</Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={showChangePasswordDialog} onDismiss={() => { setShowChangePasswordDialog(false); setCurrentMasterPassword(''); setNewMasterPassword(''); }}>
          {/* Fix: Color property will be valid after theme.ts fixes. */}
          <Dialog.Title style={{color: theme.colors.onSurface}}>Change Master Password</Dialog.Title>
          <Dialog.Content>
            {/* Fix: Color property will be valid after theme.ts fixes. */}
            <Text style={{color: theme.colors.onSurfaceVariant, marginBottom:10}}>Please enter your current and new master passwords.</Text>
            <TextInput
              label="Current Master Password"
              value={currentMasterPassword}
              onChangeText={setCurrentMasterPassword}
              secureTextEntry
              mode="outlined"
              // Fix: Color property will be valid after theme.ts fixes.
              style={{backgroundColor: theme.colors.surface}}
              autoFocus
              disabled={isToggleLoading}
            />
            <TextInput
              label="New Master Password"
              value={newMasterPassword}
              onChangeText={setNewMasterPassword}
              secureTextEntry
              mode="outlined"
              // Fix: Color property will be valid after theme.ts fixes.
              style={{backgroundColor: theme.colors.surface, marginTop: 10}}
              disabled={isToggleLoading}
            />
          </Dialog.Content>
          <Dialog.Actions>
            {/* Fix: Color properties will be valid after theme.ts fixes. */}
            <Button onPress={() => { setShowChangePasswordDialog(false); setCurrentMasterPassword(''); setNewMasterPassword(''); }} textColor={theme.colors.onSurfaceVariant} disabled={isToggleLoading}>Cancel</Button>
            <Button onPress={async () => {
              if (!currentMasterPassword || !newMasterPassword) return;
              setIsToggleLoading(true);
              const success = await changeMasterPassword(currentMasterPassword, newMasterPassword);
              setIsToggleLoading(false);
              if (success) {
                setShowChangePasswordDialog(false);
                setCurrentMasterPassword('');
                setNewMasterPassword('');
              }
            }} loading={isToggleLoading} disabled={!currentMasterPassword || !newMasterPassword || isToggleLoading} textColor={theme.colors.primary}>Confirm & Change</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
};

export default SettingsScreen;
