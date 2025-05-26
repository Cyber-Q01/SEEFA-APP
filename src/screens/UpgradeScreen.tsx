


import React, { useState, useRef } from 'react';
import { View, StyleSheet, Alert, Linking, ScrollView } from 'react-native';
import { Button, Text, Card, useTheme, ActivityIndicator, List, Portal, Modal } from 'react-native-paper';
// Fix: Changed to import PaystackWebView and PaystackWebViewRef
import { PaystackWebView, PaystackWebViewRef } from 'react-native-paystack-webview';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Constants from 'expo-constants';

// Fix: useAppContext will be exported from AppDataContext.tsx
import { useAppContext } from '../contexts/AppDataContext';
import { UserPlan } from '../types';
import { PAYSTACK_PUBLIC_KEY, PAYMENT_AMOUNT_KOBO, PAYMENT_CURRENCY, APP_NAME } from '../config/constants';
import { RootStackParamList } from '../navigation/AppNavigator';
import { AppThemeType } from '../config/theme';


type UpgradeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Upgrade'>;

const makeStyles = (theme: AppThemeType) => StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  scrollContainer: { // For ScrollView content
    paddingBottom: 32, // Add padding at the bottom
  },
  centered: {
    flex:1,
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


const UpgradeScreen: React.FC = () => {
  const theme = useTheme<AppThemeType>();
  const styles = makeStyles(theme);
  const navigation = useNavigation<UpgradeScreenNavigationProp>();
  const { plan, upgradeToPro, isLoading: contextLoading } = useAppContext();
  const [showPaystackModal, setShowPaystackModal] = useState(false);
  // Fix: Use PaystackWebViewRef for the ref type
  const paystackWebViewRef = useRef<PaystackWebViewRef>(null); 

  const userEmail = `user_${Constants.installationId?.substring(0,6) || 'guest'}@${APP_NAME.toLowerCase()}.app`;

  if (contextLoading) {
    // Fix: Color properties will be valid after theme.ts fixes.
    return <View style={[styles.centered, {backgroundColor: theme.colors.background}]}><ActivityIndicator size="large" color={theme.colors.primary}/></View>;
  }

  if (plan === UserPlan.Pro) {
    return (
      // Fix: Color properties will be valid after theme.ts fixes.
      <View style={[styles.container, styles.centered, {backgroundColor: theme.colors.background}]}>
        <List.Icon icon="check-circle" color={theme.colors.tertiary} style={{alignSelf: 'center', marginBottom: 10}}/>
        <Text variant="headlineMedium" style={[styles.title, {color: theme.colors.onBackground}]}>You are already a Pro User!</Text>
        <Text variant="bodyLarge" style={[styles.subTitle, {color: theme.colors.onSurfaceVariant}]}>Enjoy unlimited entries and all premium features.</Text>
        <Button mode="contained" onPress={() => navigation.goBack()} style={styles.button}>
          Back to Dashboard
        </Button>
      </View>
    );
  }

  const startPayment = () => {
    if ((PAYSTACK_PUBLIC_KEY as string) === 'pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' || PAYSTACK_PUBLIC_KEY.startsWith('pk_live_') && PAYSTACK_PUBLIC_KEY.includes('b6a7405c6aa130017c2c4cfea16192702bcff3ae') === false) { // Check for placeholder or incorrect live key format
      Alert.alert(
        "Developer/Test Mode",
        "Paystack is configured with a placeholder or test key. Ensure your actual live or test key is in src/config/constants.ts to proceed with payments."
      );
      // return; // Uncomment if you want to block payment with placeholder test key
    }
    setShowPaystackModal(true);
  };


  return (
    <>
    {/* Fix: Color properties will be valid after theme.ts fixes. */}
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]} contentContainerStyle={styles.scrollContainer}>
      <Card style={[styles.card, {backgroundColor: theme.colors.surface}]}>
        <Card.Title
            title={`Upgrade to ${APP_NAME} Pro`}
            titleVariant="headlineSmall"
            // Fix: Color properties will be valid after theme.ts fixes.
            titleStyle={[styles.title, {color: theme.colors.onSurface}]}
            subtitle={`Unlock unlimited entries for just ₦${PAYMENT_AMOUNT_KOBO / 100}.`}
            subtitleStyle={[styles.subTitle, {color: theme.colors.onSurfaceVariant}]}
        />
        <Card.Content style={styles.benefitsCardContent}>
            {/* Fix: Color properties will be valid after theme.ts fixes. */}
            <List.Section title="Pro Plan Benefits" titleStyle={{color: theme.colors.primary}}>
                <List.Item
                    title="Store unlimited passwords"
                    // Fix: Color properties will be valid after theme.ts fixes.
                    left={props => <List.Icon {...props} icon="lock-check-outline" color={theme.colors.tertiary} style={styles.listIcon}/>}
                    titleStyle={{color: theme.colors.onSurfaceVariant}}
                />
                <List.Item
                    title="Store unlimited Web3 keys"
                    // Fix: Color properties will be valid after theme.ts fixes.
                    left={props => <List.Icon {...props} icon="key-chain" color={theme.colors.tertiary} style={styles.listIcon}/>}
                    titleStyle={{color: theme.colors.onSurfaceVariant}}
                />
                 <List.Item
                    title="One-time payment"
                    // Fix: Color properties will be valid after theme.ts fixes.
                    left={props => <List.Icon {...props} icon="credit-card-check-outline" color={theme.colors.tertiary} style={styles.listIcon}/>}
                    titleStyle={{color: theme.colors.onSurfaceVariant}}
                />
                <List.Item
                    title="Priority support (future)"
                    // Fix: Color properties will be valid after theme.ts fixes.
                    left={props => <List.Icon {...props} icon="headset" color={theme.colors.tertiary} style={styles.listIcon}/>}
                    titleStyle={{color: theme.colors.onSurfaceVariant}}
                />
                <List.Item
                    title="Early access to new features (future)"
                    // Fix: Color properties will be valid after theme.ts fixes.
                    left={props => <List.Icon {...props} icon="star-circle-outline" color={theme.colors.tertiary} style={styles.listIcon}/>}
                    titleStyle={{color: theme.colors.onSurfaceVariant}}
                />
            </List.Section>
             <Button
                mode="contained"
                icon="arrow-up-circle-outline"
                onPress={startPayment}
                style={styles.button}
                labelStyle={styles.buttonLabel}
                // Fix: Color property will be valid after theme.ts fixes.
                textColor={theme.colors.onPrimary} 
            >
                Upgrade to Pro - ₦{PAYMENT_AMOUNT_KOBO / 100}
            </Button>
            <Button
                mode="text"
                onPress={() => navigation.goBack()}
                style={[styles.button, {marginTop: 8}]} // Less margin for text button
                labelStyle={[styles.buttonLabel, {fontSize: 14, fontWeight:'normal'}]} // Smaller text
                // Fix: Color property will be valid after theme.ts fixes.
                textColor={theme.colors.onSurfaceVariant}
            >
                Maybe Later
            </Button>
        </Card.Content>
      </Card>
    </ScrollView>

    {showPaystackModal && (
         <Portal>
            <Modal visible={showPaystackModal} onDismiss={() => setShowPaystackModal(false)} contentContainerStyle={styles.modalContainer}>
                 {/* Fix: Color property will be valid after theme.ts fixes. */}
                 <View style={{ flex: 1, width: '100%', backgroundColor: theme.colors.background }}>
                    {/* Fix: Use PaystackWebView component */}
                    <PaystackWebView
                        paystackKey={PAYSTACK_PUBLIC_KEY}
                        billingEmail={userEmail}
                        amount={PAYMENT_AMOUNT_KOBO / 100} // Paystack component expects amount in base currency units (Naira here, not kobo)
                        currency={PAYMENT_CURRENCY}
                        onCancel={(e) => {
                        // console.log('Paystack Cancelled:', e);
                        setShowPaystackModal(false);
                        Alert.alert("Payment Cancelled", "You have cancelled the payment process.");
                        }}
                        onSuccess={async (res) => {
                        // console.log('Paystack Success:', res);
                        setShowPaystackModal(false);
                        if (res.status === 'success') {
                            await upgradeToPro(); // Call without arguments
                            Alert.alert("Payment Successful!", "You have successfully upgraded to the Pro plan.");
                            navigation.navigate('Home');
                        } else {
                            Alert.alert("Payment Failed", `Transaction reference: ${res.transactionRef || 'N/A'}. Please try again or contact support.`);
                        }
                        }}
                        ref={paystackWebViewRef}
                        autoStart={true} // Auto start transaction
                        // Fix: Color property will be valid after theme.ts fixes.
                        activityIndicatorColor={theme.colors.primary}
                    />
                </View>
            </Modal>
        </Portal>
    )}
    </>
  );
};

export default UpgradeScreen;