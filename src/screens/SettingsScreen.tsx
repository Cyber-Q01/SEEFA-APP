import React, { useState } from 'react';
import { View, StyleSheet, Alert, Platform, Linking, GestureResponderEvent } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { List, Switch, Button, useTheme, Text, Divider, TextInput, ActivityIndicator, Dialog, Portal, RadioButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Constants from 'expo-constants';
import * as MailComposer from 'expo-mail-composer';

import { useAppData } from '../contexts/AppDataContext';
import { RootStackParamList } from '../navigation/AppNavigator';
import { APP_NAME } from '../config/constants';
import { AppThemeType } from '../config/theme';
import { backupVault, restoreVault } from '../utils/backup';
import * as Sharing from 'expo-sharing';
import { useThemeMode } from '../contexts/ThemeContext';

type SettingsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Settings'>;

const makeStyles = (theme: AppThemeType) =>
  StyleSheet.create({
    container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: theme.colors.primary,
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 8,
  },
  listItemDescription: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
  },
  divider: {},
  buttonLabel: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});

const SettingsScreen: React.FC = () => {
  const theme = useTheme<AppThemeType>();
  const styles = makeStyles(theme);
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const {
    lockApp,
    isBiometricsSupported,
    isBiometricsEnabled,
    toggleBiometrics,
    isAppLocked,
    changeMasterPassword,
    isPro,
  } = useAppData();

  // const { mode, setMode } = useThemeMode();

  const [isToggleLoading, setIsToggleLoading] = useState(false);
  const [masterPasswordForBiometrics, setMasterPasswordForBiometrics] = useState('');
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showChangePasswordDialog, setShowChangePasswordDialog] = useState(false);
  const [currentMasterPassword, setCurrentMasterPassword] = useState('');
  const [newMasterPassword, setNewMasterPassword] = useState('');
  // const { toggleTheme } = useThemeMode();

  const handleToggleBiometricsSwitch = async (enable: boolean) => {
    if (isAppLocked) {
      Alert.alert('App Locked', 'Please unlock the app to change settings.');
      return;
    }
    if (enable) {
      setShowPasswordDialog(true);
    } else {
      setIsToggleLoading(true);
      const success = await toggleBiometrics(false);
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
    setMasterPasswordForBiometrics('');
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
  };

  const contactEmail = Constants.expoConfig?.extra?.SUPPORT_EMAIL;

  const handleContactSupport = () => {
    MailComposer.composeAsync({
      recipients: [contactEmail],
      subject: 'Support Request',
      body: '',
    });
  };

  function handleImport(e: GestureResponderEvent): void {
    throw new Error('Function not implemented.');
  }

  function handleExport(e: GestureResponderEvent): void {
    throw new Error('Function not implemented.');
  }

  return (
    <>
      <ScrollView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.scrollContent}
      >
        <List.Section title="Security Settings" titleStyle={styles.sectionTitle}>
          <List.Item
            title="Change Master Password"
            description="Update your main app password"
            left={props => <List.Icon {...props} icon="form-textbox-password" color={theme.colors.onSurfaceVariant} />}
            onPress={handleChangeMasterPassword}
            disabled={isAppLocked}
            titleStyle={{ color: theme.colors.onSurface }}
            descriptionStyle={styles.listItemDescription}
          />
          <Divider style={styles.divider} />
          {isBiometricsSupported && (
            <>
              <List.Item
                title="Unlock with Biometrics"
                description={isBiometricsEnabled ? "Enabled" : "Disabled"}
                left={props => <List.Icon {...props} icon={isBiometricsEnabled ? "fingerprint" : "fingerprint-off"} color={theme.colors.onSurfaceVariant} />}
                right={() => <Switch value={isBiometricsEnabled} onValueChange={() => handleToggleBiometricsSwitch(!isBiometricsEnabled)} disabled={isToggleLoading || isAppLocked} color={theme.colors.primary} />}
                onPress={() => handleToggleBiometricsSwitch(!isBiometricsEnabled)}
                disabled={isAppLocked}
                titleStyle={{ color: theme.colors.onSurface }}
                descriptionStyle={styles.listItemDescription}
              />
              <Divider style={styles.divider} />
            </>
          )}
          <List.Item
            title="Lock App Now"
            description="Immediately secure the application"
            left={props => <List.Icon {...props} icon="lock-outline" color={theme.colors.onSurfaceVariant} />}
            onPress={handleLockApp}
            titleStyle={{ color: theme.colors.onSurface }}
            descriptionStyle={styles.listItemDescription}
          />
        </List.Section>

        <List.Section title="Data Management" titleStyle={styles.sectionTitle}>
          <Divider style={styles.divider} />
          <List.Item
            title="Delete All Data"
            description="Permanently erase all saved entries"
            titleStyle={{ color: theme.colors.error }}
            left={props => <List.Icon {...props} icon="delete-alert-outline" color={theme.colors.error} />}
            onPress={() => Alert.alert("Feature Not Implemented", "This critical feature is planned for a future update and will require multiple confirmations.")}
            disabled={isAppLocked}
            descriptionStyle={[styles.listItemDescription, { color: theme.colors.errorContainer }]}
          />
        </List.Section>

        <List.Section title="Legal & Support" titleStyle={styles.sectionTitle}>
          <List.Item
            title="Privacy Policy"
            description="How we handle your data"
            left={props => <List.Icon {...props} icon="shield-account-outline" color={theme.colors.onSurfaceVariant} />}
            onPress={() => navigation.navigate('PrivacyPolicy')}
            titleStyle={{ color: theme.colors.onSurface }}
            descriptionStyle={styles.listItemDescription}
          />
          <Divider style={styles.divider} />
          <List.Item
            title="Terms of Service"
            description="Rules for using SEEFA"
            left={props => <List.Icon {...props} icon="text-box-check-outline" color={theme.colors.onSurfaceVariant} />}
            onPress={() => navigation.navigate('TermsOfService')}
            titleStyle={{ color: theme.colors.onSurface }}
            descriptionStyle={styles.listItemDescription}
          />
          <Divider style={styles.divider} />
          <List.Item
            title="Contact Support"
            description={`Email: ${contactEmail}`}
            left={props => <List.Icon {...props} icon="email-outline" color={theme.colors.onSurfaceVariant} />}
            onPress={handleContactSupport}
            titleStyle={{ color: theme.colors.onSurface }}
            descriptionStyle={styles.listItemDescription}
          />
        </List.Section>

        <List.Section title="About" titleStyle={styles.sectionTitle}>
          <List.Item
            title={`${APP_NAME} App Version`}
            description={`${Constants.expoConfig?.version || '1.0.0'}`}
            left={props => <List.Icon {...props} icon="information-outline" color={theme.colors.onSurfaceVariant} />}
            titleStyle={{ color: theme.colors.onSurface }}
            descriptionStyle={styles.listItemDescription}
          />
        </List.Section>

        {/* <List.Section title="Theme" titleStyle={styles.sectionTitle}>
          <List.Item
            title="Dark Purple Theme"
            description="Toggle between light and dark purple theme"
            left={props => <List.Icon {...props} icon="brightness-6" color={theme.colors.onSurfaceVariant} />}
            right={() => (
              <Switch
                value={mode === 'dark' as typeof mode}
                onValueChange={toggleTheme}
                color={theme.colors.primary}
              />
            )}
            titleStyle={{ color: theme.colors.onSurface }}
            descriptionStyle={styles.listItemDescription}
          />
        </List.Section> */}

        {isToggleLoading && <ActivityIndicator animating={true} style={{ marginVertical: 20 }} color={theme.colors.primary} />}

        <View style={{ flexDirection: 'row', justifyContent: 'center', margin: 16 }}>
          {isPro ? (
            <>
              <Button
                icon="download"
                mode="outlined"
                onPress={async () => {
                  const fileUri = await backupVault();
                  if (fileUri) {
                    await Sharing.shareAsync(fileUri);
                  }
                }}
                style={{ marginRight: 8 }}
              >
                Backup Vault
              </Button>
              <Button
                icon="upload"
                mode="outlined"
                onPress={async () => {
                  const ok = await restoreVault();
                  if (ok) {
                    Alert.alert('Success', 'Vault restored! Please restart the app.');
                  } else {
                    Alert.alert('Error', 'Failed to restore vault.');
                  }
                }}
              >
                Restore Vault
              </Button>
            </>
          ) : (
            <Button
                mode="contained"
            onPress={() => navigation.navigate('Upgrade')}
            style={{ marginBottom: 8 }}
              
              icon="arrow-up-circle-outline"
              
              // style={styles.button}
              labelStyle={styles.buttonLabel}
              textColor={theme.colors.onPrimary}
            >
              Upgrade to Pro for Backup/Restore
            </Button>
          )}
        </View>

        {/* Pro Features Section - Import/Export */}
        <View style={{ flexDirection: 'column', alignItems: 'center', margin: 16 }}>
          {isPro ? (
            <>
              <Button onPress={handleImport} mode="outlined" style={{ marginVertical: 8 }}>
                Import Entries
              </Button>
              <Button onPress={handleExport} mode="outlined" style={{ marginVertical: 8 }}>
                Export Entries
              </Button>
            </>
          ) : null}
        </View>

      </ScrollView>

      <Portal>
        <Dialog visible={showPasswordDialog} onDismiss={() => { setShowPasswordDialog(false); setMasterPasswordForBiometrics(''); }}>
          <Dialog.Title style={{ color: theme.colors.onSurface }}>Enable Biometric Unlock</Dialog.Title>
         <Dialog.Content style={{ backgroundColor: theme.colors.surface }}>
            <Text style={{ color: theme.colors.onSurfaceVariant, marginBottom: 10 }}>Please enter your master password to confirm and enable biometric authentication.</Text>
            <TextInput
              label="Master Password"
              value={masterPasswordForBiometrics}
              onChangeText={setMasterPasswordForBiometrics}
              secureTextEntry
              mode="outlined"
              style={{ backgroundColor: theme.colors.surface }}
              autoFocus
              disabled={isToggleLoading}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => { setShowPasswordDialog(false); setMasterPasswordForBiometrics(''); }} textColor={theme.colors.onSurfaceVariant} disabled={isToggleLoading}>Cancel</Button>
            <Button onPress={confirmEnableBiometrics} loading={isToggleLoading} disabled={!masterPasswordForBiometrics || isToggleLoading} textColor={theme.colors.primary}>Confirm & Enable</Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={showChangePasswordDialog} onDismiss={() => { setShowChangePasswordDialog(false); setCurrentMasterPassword(''); setNewMasterPassword(''); }}>
          <Dialog.Title style={{ color: theme.colors.onSurface }}>Change Master Password</Dialog.Title>
          <Dialog.Content>
            <Text style={{ color: theme.colors.onSurfaceVariant, marginBottom: 10 }}>Please enter your current and new master passwords.</Text>
            <TextInput
              label="Current Master Password"
              value={currentMasterPassword}
              onChangeText={setCurrentMasterPassword}
              secureTextEntry
              mode="outlined"
              style={{ backgroundColor: theme.colors.surface }}
              autoFocus
              disabled={isToggleLoading}
            />
            <TextInput
              label="New Master Password"
              value={newMasterPassword}
              onChangeText={setNewMasterPassword}
              secureTextEntry
              mode="outlined"
              style={{ backgroundColor: theme.colors.surface, marginTop: 10 }}
              disabled={isToggleLoading}
            />
          </Dialog.Content>
          <Dialog.Actions>
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
