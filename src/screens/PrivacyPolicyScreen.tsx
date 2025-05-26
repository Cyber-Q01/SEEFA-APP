import React from 'react';
// Fix: Added 'View' to import from 'react-native'
import { ScrollView, StyleSheet, Linking, View } from 'react-native';
import { Text, useTheme, Appbar, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { AppThemeType } from '../config/theme';

// IMPORTANT: This is a TEMPLATE. Review and customize with a legal professional.
const PRIVACY_POLICY_TEXT_SECTIONS = [
  {
    heading: "Privacy Policy for SEEFA",
    lastUpdated: true, // Will be replaced by dynamic date or placeholder
    paragraphs: [
      "Welcome to SEEFA (\"we,\" \"us,\" or \"our\"). We are committed to protecting your privacy and handling your data in an open and transparent manner. This Privacy Policy explains how we collect, use, process,and safeguard your information when you use our mobile application, SEEFA (the \"App\").",
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
      },
      {
        title: "d. Anonymous Usage Data (Conceptual - IF IMPLEMENTED):",
        points: [
          "[IF YOU IMPLEMENT ANALYTICS, DESCRIBE IT HERE. E.g., \"We may collect anonymous, aggregated usage statistics to help us improve the App, such as features used or crash reports. This data does not personally identify you and does not include any of your sensitive stored entries.\"]",
          "Currently, SEEFA is designed not to collect such usage data by default."
        ]
      }
    ]
  },
  {
    heading: "2. How We Use Your Information",
    paragraphs: [
      "To Provide and Maintain the App: To enable you to securely store, manage, and access your passwords and Web3 keys locally on your device.",
      "To Encrypt Your Data: To use your Master Password (or biometrically protected key) to encrypt and decrypt your data stored within the App on your device.",
      "To Process Plan Upgrades: To facilitate your upgrade to the Pro plan through Paystack and update your plan status in the App.",
      "To Improve the App: [IF ANALYTICS IMPLEMENTED: \"To understand how users interact with the App to improve its functionality, usability, and security features.\"]"
    ]
  },
  {
    heading: "3. Data Storage and Security",
    paragraphs: [
      "Local Storage: All your sensitive data (passwords, Web3 keys, etc.) is encrypted using strong AES-256 encryption and stored exclusively on your device's local storage.",
      "Encryption: Your data is encrypted using a key derived from your Master Password. It is crucial that you choose a strong, unique Master Password and keep it confidential. **If you forget your Master Password, your data will be irrecoverable as we do not have access to it or your Master Password.**",
      "Biometric Security: If enabled, biometric authentication provides an additional layer of convenience for accessing your encrypted data, relying on your device's built-in security features.",
      "No Server-Side Storage of Sensitive Data: We do not transmit or store your sensitive vault data on any external servers."
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
                "With Payment Processors: Anonymized or transactional data may be shared with Paystack solely for the purpose of processing your Pro plan payment.",
                "Legal Requirements: If required by law, subpoena, or other legal process in Nigeria, we may disclose information we have (which is extremely limited, primarily to non-sensitive data if any is ever collected by us directly)."
            ]
        }
    ]
  },
  {
    heading: "5. Your Data Protection Rights (under NDPR/NDPA)",
    paragraphs: [
      "As your sensitive data is stored locally under your control:",
    ],
    subSections: [
        {
            points: [
                "Access, Rectification, Erasure: You can directly access, modify, or delete your entries within the App.",
                "Data Backup and Responsibility: You are solely responsible for backing up your device and the App's data if you wish to prevent data loss due to device failure, loss, or uninstallation of the App. SEEFA does not currently offer an automated backup or export feature for your encrypted data."
            ]
        }
    ],
    paragraphsAfterSubsections: [ // New field for paragraphs after subsections
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
      "[Your Email Address for Support/Privacy Inquiries - e.g., support@seefa.app]",
      "[Your Business Name/Developer Name, if applicable]",
      "[Your Business Address, if applicable - Nigerian business registration may require this]",
      "This Privacy Policy is governed by the laws of the Federal Republic of Nigeria."
    ]
  },
  {
    heading: "Legal Disclaimer",
    paragraphs: [
        "The contents of this Privacy Policy are for informational purposes only and do not constitute legal advice. You should consult with a qualified legal professional to ensure compliance with all applicable laws and regulations for your specific circumstances."
    ],
    isDisclaimer: true,
  }
];

type PrivacyPolicySection = {
    heading: string;
    lastUpdated?: boolean;
    paragraphs?: string[];
    subSections?: {
        title?: string;
        points: string[];
    }[];
    paragraphsAfterSubsections?: string[];
    isDisclaimer?: boolean;
};

const PrivacyPolicyScreen: React.FC = () => {
  const theme = useTheme<AppThemeType>();
  const navigation = useNavigation();
  const styles = makeStyles(theme);

  const lastUpdatedDate = "October 26, 2023"; // Placeholder: Replace with actual or dynamic date

  return (
    <>
      <Appbar.Header
        // Fix: Color property will be valid after theme.ts fixes.
        style={{ backgroundColor: theme.colors.elevation.level2 }}
        // Fix: Removed invalid 'statusBarAnimation' prop
      >
        {/* Fix: Color properties will be valid after theme.ts fixes. */}
        <Appbar.BackAction onPress={() => navigation.goBack()} color={theme.colors.onSurface} />
        <Appbar.Content title="Privacy Policy" titleStyle={{color: theme.colors.onSurface}} />
      </Appbar.Header>
      {/* Fix: Color properties will be valid after theme.ts fixes. */}
      <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.importantDisclaimer, {color: theme.colors.error, backgroundColor: theme.colors.errorContainer}]}>
            IMPORTANT: This is a template. Review and customize with a legal professional before use.
        </Text>
        {PRIVACY_POLICY_TEXT_SECTIONS.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text variant={section.isDisclaimer ? "titleMedium" : "headlineSmall"} style={[styles.heading, section.isDisclaimer && {color: theme.colors.error}]}>
              {section.heading}
            </Text>
            {section.lastUpdated && (
              <Text style={styles.paragraph}>Last Updated: {lastUpdatedDate}</Text>
            )}
            {section.paragraphs?.map((paragraph, pIndex) => (
              <Text key={pIndex} style={styles.paragraph}>
                {paragraph.includes("**") // Basic bold handling
                    ? paragraph.split("**").map((textPart, i) => (
                        <Text key={i} style={i % 2 === 1 ? styles.boldText : {}}>{textPart}</Text>
                    ))
                    : paragraph
                }
              </Text>
            ))}
            {section.subSections?.map((subSection: { title?: string; points: string[]; }, sIndex) => (
              <View key={sIndex} style={styles.subSection}>
                {subSection.title && <Text style={styles.subHeading}>{subSection.title}</Text>}
                {subSection.points?.map((point, ptIndex) => (
                  <Text key={ptIndex} style={styles.listItem}>
                    {`\u2022  ${point}`}
                  </Text>
                ))}
              </View>
            ))}
            {section.paragraphsAfterSubsections?.map((paragraph, paIndex) => (
                 <Text key={`pa-${paIndex}`} style={styles.paragraph}>{paragraph}</Text>
            ))}
          </View>
        ))}
         <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            style={styles.closeButton}
            // Fix: Color property will be valid after theme.ts fixes.
            textColor={theme.colors.primary}
        >
            Close
        </Button>
      </ScrollView>
    </>
  );
};

const makeStyles = (theme: AppThemeType) => StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  importantDisclaimer: {
    padding: 12,
    borderRadius: theme.roundness,
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 14,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 20,
  },
  heading: {
    // Fix: Color property will be valid after theme.ts fixes.
    color: theme.colors.primary,
    marginBottom: 10,
  },
  subHeading: {
    // Fix: Color property will be valid after theme.ts fixes.
    color: theme.colors.onSurface,
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  paragraph: {
    // Fix: Color property will be valid after theme.ts fixes.
    color: theme.colors.onSurfaceVariant,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 10,
    textAlign: 'justify',
  },
  boldText: {
      fontWeight: 'bold',
      // Fix: Color property will be valid after theme.ts fixes.
      color: theme.colors.onSurface,
  },
  subSection: {
    marginLeft: 10,
    marginBottom: 5,
  },
  listItem: {
    // Fix: Color property will be valid after theme.ts fixes.
    color: theme.colors.onSurfaceVariant,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 5,
    textAlign: 'justify',
  },
  closeButton: {
    marginVertical: 24,
    alignSelf: 'center',
    // Fix: Color property will be valid after theme.ts fixes.
    borderColor: theme.colors.primary,
  }
});

export default PrivacyPolicyScreen;
