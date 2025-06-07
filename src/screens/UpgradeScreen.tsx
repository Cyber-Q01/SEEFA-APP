import React, { useState, useRef } from 'react';
import { View, StyleSheet, Alert, Linking, ScrollView } from 'react-native';
import { Button, Text, Card, useTheme, ActivityIndicator, List, Portal, Modal } from 'react-native-paper';
// Fix: Changed to import PaystackWebView and PaystackWebViewRef
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Constants from 'expo-constants';

// Fix: useAppContext will be exported from AppDataContext.tsx
import { useAppData } from '../contexts/AppDataContext';
import { UserPlan } from '../types';
import { APP_NAME } from '../config/constants';
import { RootStackParamList } from '../navigation/AppNavigator';
import { AppThemeType } from '../config/theme';

const PAYMENT_AMOUNT = 4800; // Amount to be paid for the upgrade

// Define the type for the navigation prop
type UpgradeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Upgrade'>;

// Styles for the component
const makeStyles = (theme: AppThemeType) => {
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
    },
    scrollContainer: { // For ScrollView content
      paddingBottom: 32, // Add padding at the bottom
    },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    card: {
      elevation: 3,
      borderRadius: theme.roundness * 1.5,
      marginTop: 20, // Ensure card is not at the very top
      marginBottom: 20, // Space below card
    },
    title: {
      textAlign: 'center',
      marginBottom: 8,
    },
    subTitle: {
      textAlign: 'center',
      marginBottom: 16,
      lineHeight: 22,
    },
    button: {
      marginTop: 16,
      borderRadius: theme.roundness * 2,
    },
    buttonLabel: {
      paddingVertical: 6,
      fontSize: 16,
      fontWeight: 'bold',
    },
    modalContainer: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.0)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    listIcon: { // Style for List.Icon
      marginRight: 8, // Add some margin if needed
    },
    benefitsCardContent: { // Padding for benefits card
      paddingTop: 8, // Reduce top padding if Card.Title is used
    }
  });
  return styles;
};

// UpgradeScreen component
const UpgradeScreen: React.FC = () => {
  const theme = useTheme<AppThemeType>(); // Use the theme
  const styles = makeStyles(theme); // Create the styles
  const navigation = useNavigation<UpgradeScreenNavigationProp>(); // Use the navigation hook
  const { plan, isLoading: contextLoading } = useAppData(); // Get app data from context

  const installationId = Constants.installationId?.substring(0, 6) || 'guest'; // Get installation ID
  const formattedAppName = APP_NAME.toLowerCase(); // Format app name
  const userEmail = `user_${installationId}@${formattedAppName}.app`; // Create user email

  // Render the content based on the user's plan and loading state
  const renderContent = () => {
    // Show loading indicator while app data is loading
    if (contextLoading) {
      return (
        <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      );
    }

    // If user is already a Pro user, show the Pro user screen
    if (plan === UserPlan.Pro) {
      return (
        <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
          <List.Icon icon="check-circle" color={theme.colors.tertiary} style={{ alignSelf: 'center', marginBottom: 10 }} />
          <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onBackground }]}>You are already a Pro User!</Text>
          <Text variant="bodyLarge" style={[styles.subTitle, { color: theme.colors.onSurfaceVariant }]}>Enjoy unlimited entries and all premium features.</Text>
          <Button mode="contained" onPress={() => navigation.goBack()} style={styles.button}>
            Back to Dashboard
          </Button>
        </View>
      );
    }

    // Show the upgrade screen
    return (
      <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]} contentContainerStyle={styles.scrollContainer}>
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Title
            title={`Upgrade to ${APP_NAME} Pro`}
            titleVariant="headlineSmall"
            titleStyle={[styles.title, { color: theme.colors.onSurface }]}
            subtitle={`Unlock unlimited entries for just ₦${PAYMENT_AMOUNT}.`}
            subtitleStyle={[styles.subTitle, { color: theme.colors.onSurfaceVariant }]}
          />
          <Card.Content style={styles.benefitsCardContent}>
            <List.Section title="Pro Plan Benefits" titleStyle={{ color: theme.colors.primary }}>
              <List.Item
                title="Store unlimited passwords"
                left={props => <List.Icon {...props} icon="lock-check-outline" color={theme.colors.tertiary} style={styles.listIcon} />}
                titleStyle={{ color: theme.colors.onSurfaceVariant }}
              />
              <List.Item
                title="Store unlimited Web3 keys"
                left={props => <List.Icon {...props} icon="key-chain" color={theme.colors.tertiary} style={styles.listIcon} />}
                titleStyle={{ color: theme.colors.onSurfaceVariant }}
              />
              <List.Item
                title="One-time payment"
                left={props => <List.Icon {...props} icon="credit-card-check-outline" color={theme.colors.tertiary} style={styles.listIcon} />}
                titleStyle={{ color: theme.colors.onSurfaceVariant }}
              />
              <List.Item
                title="Priority support (future)"
                left={props => <List.Icon {...props} icon="headset" color={theme.colors.tertiary} style={styles.listIcon} />}
                titleStyle={{ color: theme.colors.onSurfaceVariant }}
              />
              <List.Item
                title="Early access to new features (future)"
                left={props => <List.Icon {...props} icon="star-circle-outline" color={theme.colors.tertiary} style={styles.listIcon} />}
                titleStyle={{ color: theme.colors.onSurfaceVariant }}
              />
            </List.Section>
            <Button
              mode="contained"
              icon="arrow-up-circle-outline"
              onPress={startPayment}
              style={styles.button}
              labelStyle={styles.buttonLabel}
              textColor={theme.colors.onPrimary}
            >
              Upgrade to Pro - ₦{PAYMENT_AMOUNT}
            </Button>
            <Button
              mode="text"
              onPress={() => navigation.goBack()}
              style={[styles.button, { marginTop: 8 }]} // Less margin for text button
              labelStyle={[styles.buttonLabel, { fontSize: 14, fontWeight: 'normal' }]} // Smaller text
              textColor={theme.colors.onSurfaceVariant}
            >
              Maybe Later
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    );
  };

  // Function to start the payment process
  const startPayment = () => {
    const paymentLink = 'https://paystack.shop/pay/otkxq17j6g'; // Payment link
    // Open the payment link in the browser
    if (paymentLink.trim() !== '') {
      Linking.openURL(paymentLink);
    } else {
      Alert.alert('Payment Link Error', 'Please generate a payment link and paste it in the code.');
    }
  };

  // Render the component
  return (
    <>
      {renderContent()}
    </>
  );
};

export default UpgradeScreen;
