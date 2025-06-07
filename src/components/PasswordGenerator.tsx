import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { Card, Button, TextInput, Snackbar, useTheme, Switch } from 'react-native-paper';
import Slider from '@react-native-community/slider';
import * as Clipboard from 'expo-clipboard';
import { checkPasswordBreach } from '../utils/breachCheck';
import { AppThemeType } from '../config/theme';
interface PasswordGeneratorProps {
  onAddEntry?: (password: string) => void;
  isPro: boolean;
  navigation: any;
}

const PasswordGenerator: React.FC<PasswordGeneratorProps> = ({ onAddEntry, isPro, navigation }) => {
  const theme = useTheme();
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [length, setLength] = useState(16);
  const [useSymbols, setUseSymbols] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useUppercase, setUseUppercase] = useState(true);
  const [breachCount, setBreachCount] = useState<number | null>(null);
  const [breachLoading, setBreachLoading] = useState(false);

  const handleGenerate = () => {
    let chars = 'abcdefghijklmnopqrstuvwxyz';
    if (useUppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (useNumbers) chars += '0123456789';
    if (useSymbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    let password = '';
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setGeneratedPassword(password);
  };

  const handleCopy = async () => {
    if (!generatedPassword) return;
    await Clipboard.setStringAsync(generatedPassword);
    setSnackbarVisible(true);
  };

  const handleCheckBreach = async () => {
    setBreachLoading(true);
    setBreachCount(null);
    try {
      const count = await checkPasswordBreach(generatedPassword);
      setBreachCount(count);
    } catch (e) {
      setBreachCount(-1); // error
    }
    setBreachLoading(false);
  };

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1, backgroundColor: theme.colors.surface }}>
      <Card style={{ width: '90%', padding: 16, backgroundColor: theme.colors.surface }}>
        <Card.Title title="Generate a Secure Password" />
        <Card.Content>
          <Text style={{ marginBottom: 8, color: theme.colors.primary}}>
            Password Length: {length}
          </Text>
          <Slider
            minimumValue={8}
            maximumValue={15}
            value={length}
            onValueChange={setLength}
            step={1}
            style={{ width: '100%', marginBottom: 16 }}
            minimumTrackTintColor={theme.colors.secondary}
            maximumTrackTintColor={theme.colors.onSurfaceVariant}
            thumbTintColor={theme.colors.primary}
          />
          <View style={{ marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Text style={{ flex: 1, color: theme.colors.primary }}>Uppercase</Text>
              <Switch value={useUppercase} onValueChange={setUseUppercase} />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Text style={{ flex: 1, color: theme.colors.primary }}>Numbers</Text>
              <Switch value={useNumbers} onValueChange={setUseNumbers} />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ flex: 1, color: theme.colors.primary }}>Symbols</Text>
              <Switch value={useSymbols} onValueChange={setUseSymbols} />
            </View>
          </View>
          <Button
            mode="contained"
            style={{ marginBottom: 16 }}
            onPress={handleGenerate}
          >
            Generate Password
          </Button>
          <TextInput
            label="Generated Password"
            value={generatedPassword}
            editable={false}
            style={{ marginBottom: 12 }}
            right={
              <TextInput.Icon
                icon="content-copy"
                onPress={handleCopy}
              />
            }
          />
          <Button
            mode="contained"
            onPress={() => onAddEntry && onAddEntry(generatedPassword)}
            disabled={!generatedPassword}
          >
            Add as Entry
          </Button>
          {isPro ? (
            <>
              <Button
                mode="outlined"
                onPress={handleCheckBreach}
                disabled={!generatedPassword || breachLoading}
                loading={breachLoading}
                accessibilityLabel="Check if password has been breached"
                style={{ marginBottom: 8 }}
              >
                Check Breach
              </Button>
              {breachCount !== null && breachCount >= 0 && (
                <Text style={{ color: breachCount > 0 ? theme.colors.error : theme.colors.primary, marginBottom: 8 }}>
                  {breachCount > 0
                    ? `⚠️ This password has appeared in ${breachCount} breaches!`
                    : '✅ This password was not found in known breaches.'}
                </Text>
              )}
              {breachCount === -1 && (
                <Text style={{ color: theme.colors.error, marginBottom: 8 }}>
                  Error checking breach status. Please try again.
                </Text>
              )}
              <Text style={{ fontSize: 12, color: theme.colors.onSurfaceVariant, marginBottom: 8 }}>
                Your password is never sent to any server. Only a small, anonymous hash is checked for breaches.
              </Text>
            </>
          ) : (
            <Button
              mode="contained"
              onPress={() => navigation.navigate('Upgrade')}
              style={{ marginBottom: 8 }}
            >
              Upgrade to Pro for Breach Check
            </Button>
          )}
        </Card.Content>
      </Card>
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={2000}
      >
        Password copied to clipboard!
      </Snackbar>
    </View>
  );
};

export default PasswordGenerator;
