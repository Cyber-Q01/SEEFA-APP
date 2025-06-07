import React, { useState } from 'react';
import { View, StyleSheet, StatusBar, Platform } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';

const steps = [
  {
    title: 'Welcome to SEEFA!',
    content: 'Your secure password manager. Store, generate, and manage credentials safely.',
  },
  {
    title: 'Generate Strong Passwords',
    content: 'Use our built-in generator for strong, unique passwords.',
  },
  {
    title: 'Biometric Unlock',
    content: 'Enable fingerprint or Face ID for quick, secure access.',
  },
];

const OnboardingScreen = ({ onDone }: { onDone: () => void }) => {
  const [step, setStep] = useState(0);
  const theme = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* StatusBar overlay for Android */}
      {Platform.OS === 'android' && (
        <View style={{ height: StatusBar.currentHeight, backgroundColor: theme.colors.background }} />
      )}
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />
      <View style={styles.container}>
        <Text variant="headlineMedium" style={{ marginBottom: 16 }}>{steps[step].title}</Text>
        <Text style={{ marginBottom: 32 }}>{steps[step].content}</Text>
        {step < steps.length - 1 ? (
          <Button mode="contained" onPress={() => setStep(step + 1)}>Next</Button>
        ) : (
          <Button mode="contained" onPress={onDone}>Get Started</Button>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
});

export default OnboardingScreen;