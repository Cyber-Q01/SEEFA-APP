import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { Text, Button, TextInput, useTheme, Card, IconButton } from 'react-native-paper';
import { useAppData } from '../contexts/AppDataContext';

const AppLockScreen: React.FC = () => {
  const theme = useTheme();
  const { unlockApp, isLoading } = useAppData();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleUnlock = async () => {
    setError(null);
    const success = await unlockApp(password);
    if (!success) {
      setError('Incorrect password. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.centered}>
       
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <View style={styles.iconRow}>
            <Image source={require('../../assets/icon.png')} style={{ width: 64, height: 64, alignSelf: 'center', marginBottom: 12 }} />
            </View>
            <Text variant="headlineSmall" style={styles.title}>
              App Locked
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
              Enter your master password to unlock SEEFA.
            </Text>
            <TextInput
              label="Master Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
              disabled={isLoading}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleUnlock}
            />
            {error && (
              <Text style={{ color: theme.colors.error, marginBottom: 8, textAlign: 'center' }}>{error}</Text>
            )}
            <Button
              mode="contained"
              onPress={handleUnlock}
              loading={isLoading}
              disabled={isLoading || !password}
              style={styles.button}
            >
              Unlock
            </Button>
          </Card.Content>
        </Card>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 370,
    elevation: 4,
    borderRadius: 16,
    paddingVertical: 16,
  },
  iconRow: {
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    textAlign: 'center',
    marginBottom: 4,
    fontWeight: 'bold',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 15,
  },
  input: {
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  button: {
    marginTop: 4,
    borderRadius: 8,
  },
});

export default AppLockScreen;