import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Text, useTheme, Appbar, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { AppThemeType } from '../config/theme';

// Define the structure for privacy policy sections
const PRIVACY_POLICY_TEXT_SECTIONS = [
  {
    heading: "Privacy Policy for SEEFA",
    lastUpdated: true,
    paragraphs: [
      "Welcome to SEEFA (\"we,\" \"us,\" or \"our\"). We are committed to protecting your privacy and handling your data in an open and transparent manner. This Privacy Policy explains how we collect, use, process, and safeguard your information when you use our mobile application, SEEFA (the \"App\").",
      "Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the application."
    ],
  },
  {
    heading: "1. Information We Collect",
    paragraphs: [
      "SEEFA is designed as a local-only secure storage application. We do NOT collect or store your sensitive data (passwords, secret phrases, private keys, PIN codes, etc.) on our servers. All such data you enter into SEEFA is encrypted and stored exclusively on your local device.",
      "The information we may process includes:",
    ],
    subSections: [
      {
        title: "a. Locally Stored Data (Encrypted on Your Device):",
        points: [
          "Password Entries: App/Website Name, Username, Encrypted Password Value, Website URL (optional), Category (optional).",
          "Web3 Key Entries: Label, Wallet Name, Project Name (optional), Encrypted Secret Phrase (optional), Encrypted Secret Key (optional), Encrypted PIN Code (optional), Website URL (optional), Category (optional).",
          "Master Password Derivative: The Master Password you set is used to derive an encryption key. We do not store your Master Password. The encryption key is used to encrypt and decrypt your data locally.",
          "Salt for Key Derivation: A unique salt used in deriving your encryption key is stored locally on your device.",
          "Biometric Authentication Key: If you enable biometric authentication, a version of your encryption key may be stored in your device's secure hardware (e.g., iOS Keychain, Android Keystore) protected by your device's biometric security."
        ]
      },
      {
        title: "b. Information for Pro Plan Upgrade (Processed by Paystack):",
        points: [
          "If you choose to upgrade to the Pro plan, you will be redirected to our payment processor, Paystack.",
          "Paystack may collect payment information directly from you, such as your email address, payment card details, and billing information, as necessary to process the transaction.",
          "We do not collect or store your full payment card details. We may receive transaction confirmation (e.g., success or failure, transaction ID) from Paystack to update your plan status within the App.",
          "Your interaction with Paystack is governed by Paystack's own Privacy Policy and Terms of Service, which you should review."
        ]
      },
      {
        title: "c. Locally Stored App Status Information:",
        points: [
          "User Plan: Your current plan (Free or Pro) is stored locally on your device.",
          "Biometrics Enabled Status: Whether you have enabled biometric authentication is stored locally."
        ]
      }
    ]
  },
  {
    heading: "2. How We Use Your Information",
    paragraphs: [
      "To provide and maintain the App: To enable you to securely store, manage, and access your passwords and Web3 keys locally on your device.",
      "To encrypt your data: To use your Master Password (or biometrically protected key) to encrypt and decrypt your data stored within the App on your device.",
      "To process plan upgrades: To facilitate your upgrade to the Pro plan through Paystack and update your plan status in the App."
    ]
  },
  {
    heading: "3. Data Storage and Security",
    paragraphs: [
      "All your sensitive data (passwords, Web3 keys, etc.) is encrypted using strong AES-256 encryption and stored exclusively on your device's local storage.",
      "Your data is encrypted using a key derived from your Master Password. It is crucial that you choose a strong, unique Master Password and keep it confidential. If you forget your Master Password, your data will be irrecoverable as we do not have access to it or your Master Password.",
      "If enabled, biometric authentication provides an additional layer of convenience for accessing your encrypted data, relying on your device's built-in security features.",
      "We do not transmit or store your sensitive vault data on any external servers."
    ]
  },
  {
    heading: "4. Data Sharing and Disclosure",
    paragraphs: [
      "Since your sensitive vault data is stored locally and encrypted on your device, we do not have access to it and therefore cannot share or disclose it.",
      "We may share information in the following limited circumstances:",
    ],
    subSections: [
      {
        points: [
          "With Payment Processors: Transactional data may be shared with Paystack solely for the purpose of processing your Pro plan payment.",
          "Legal Requirements: If required by law, subpoena, or other legal process in Nigeria, we may disclose information we have (which is extremely limited, primarily to non-sensitive data if any is ever collected by us directly)."
        ]
      }
    ]
  },
  {
    heading: "5. Your Data Protection Rights",
    paragraphs: [
      "As your sensitive data is stored locally under your control:",
    ],
    subSections: [
      {
        points: [
          "Access, Rectification, Erasure: You can directly access, modify, or delete your entries within the App.",
          "Data Backup and Responsibility: You are solely responsible for backing up your device and the App's data if you wish to prevent data loss due to device failure, loss, or uninstallation of the App."
        ]
      }
    ],
    paragraphsAfterSubsections: [
      "If you have questions about your data that is not directly manageable within the app (e.g., pertaining to payment transaction records if any), please contact us."
    ]
  },
  {
    heading: "6. Children's Privacy",
    paragraphs: [
      "SEEFA is not intended for use by individuals under the age of 18. We do not knowingly collect personal information from children under 18."
    ]
  },
  {
    heading: "7. Changes to This Privacy Policy",
    paragraphs: [
      "We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy within the App and updating the \"Last Updated\" date. You are advised to review this Privacy Policy periodically for any changes."
    ]
  },
  {
    heading: "8. Contact Us",
    paragraphs: [
      "If you have any questions about this Privacy Policy, please contact us at:",
      "[Your Email Address for Support/Privacy Inquiries]",
      "[Your Business Name/Developer Name, if applicable]",
      "[Your Business Address, if applicable]",
      "This Privacy Policy is governed by the laws of the Federal Republic of Nigeria."
    ]
  },
  {
    heading: "Breach Check Privacy",
    paragraphs: [
      "When you use the breach check feature, your password is never sent to any server. Instead, only a small, anonymous portion of its cryptographic hash is sent to the Have I Been Pwned API using a privacy-respecting method (k-Anonymity). This ensures your password remains private and secure."
    ]
  }
];

// Define the type for a privacy policy section
type PrivacyPolicySection = {
  heading: string;
  lastUpdated?: boolean;
  paragraphs?: string[];
  subSections?: ({ title: string; points: string[]; } | { points: string[]; })[];
  paragraphsAfterSubsections?: string[];
};

// PrivacyPolicyScreen component
const PrivacyPolicyScreen: React.FC = () => {
  const theme = useTheme<AppThemeType>(); // Use the theme
  const navigation = useNavigation(); // Use the navigation hook
  const styles = makeStyles(theme); // Create the styles

  const lastUpdatedDate = "October 26, 2023"; // Update as needed

  // Render the component
  return (
    <>
      {/* Appbar header */}
      <Appbar.Header style={{ backgroundColor: theme.colors.elevation.level2 }}>
        <Appbar.BackAction onPress={() => navigation.goBack()} color={theme.colors.onSurface} />
        <Appbar.Content title="Privacy Policy" titleStyle={{color: theme.colors.onSurface}} />
      </Appbar.Header>
      {/* Scrollable content */}
      <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Map through the privacy policy sections */}
        {PRIVACY_POLICY_TEXT_SECTIONS.map((section, index) => (
          // Privacy Policy Section - Main container for each section
          <View key={index} style={styles.section}>
            {/* Section heading */}
            <Text variant="headlineSmall" style={styles.heading}>
              {section.heading}
            </Text>
            {/* Last updated date */}
            {section.lastUpdated && (
              <Text style={styles.paragraph}>Last Updated: {lastUpdatedDate}</Text>
            )}
            {/* Section paragraphs */}
            {section.paragraphs?.map((paragraph, pIndex) => (
              // Section paragraph - Individual paragraph within a section
              <Text key={pIndex} style={styles.paragraph}>{paragraph}</Text>
            ))}
            {/* Section sub sections */}
            {section.subSections?.map((subSection, sIndex) => (
              <View key={sIndex} style={styles.subSection}>
                {/* Sub section title - check if title exists before rendering */}
                {('title' in subSection) && <Text style={styles.subHeading}>{subSection.title}</Text>}
                {/* Sub section points */}
                {('points' in subSection) && subSection.points?.map((point, ptIndex) => (
                  // Sub section point - Individual point within a sub section
                  <Text key={ptIndex} style={styles.listItem}>
                    {`\u2022  ${point}`}
                  </Text>
                ))}
              </View>
            ))}
            {/* Paragraphs after sub sections */}
            {section.paragraphsAfterSubsections?.map((paragraph, paIndex) => (
              // Paragraph after sub sections - Paragraphs that appear after the sub sections
              <Text key={`pa-${paIndex}`} style={styles.paragraph}>{paragraph}</Text>
            ))}
          </View>
        ))}
        {/* Close button */}
        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          style={styles.closeButton}
          textColor={theme.colors.primary}
        >
          Close
        </Button>
      </ScrollView>
    </>
  );
};

// Styles for the component
const makeStyles = (theme: AppThemeType) => StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  section: {
    marginBottom: 20,
  },
  heading: {
    color: theme.colors.primary,
    marginBottom: 10,
  },
  subHeading: {
    color: theme.colors.onSurface,
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  paragraph: {
    color: theme.colors.onSurfaceVariant,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 10,
    textAlign: 'justify',
  },
  subSection: {
    marginLeft: 10,
    marginBottom: 5,
  },
  listItem: {
    color: theme.colors.onSurfaceVariant,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 5,
    textAlign: 'justify',
  },
  closeButton: {
    marginVertical: 24,
    alignSelf: 'center',
    borderColor: theme.colors.primary,
  }
});

export default PrivacyPolicyScreen;
