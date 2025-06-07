import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text, useTheme, Appbar, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { AppThemeType } from '../config/theme';

const TERMS_OF_SERVICE_SECTIONS = [
  {
    heading: "Terms of Service for SEEFA",
    lastUpdated: true,
    paragraphs: [
      "Please read these Terms of Service (\"Terms\") carefully before using the SEEFA mobile application (the \"App\") operated by ShalomTech (\"us,\" \"we,\" or \"our\").",
      "By accessing or using the App, you agree to be bound by these Terms. If you do not agree with any part of the terms, please do not use the App."
    ],
  },
  {
    heading: "1. Description of Service",
    paragraphs: [
      "SEEFA is a mobile application that allows you to securely store, manage, and access passwords, Web3 private keys, and related information (\"User Data\") locally on your device. All User Data is encrypted on your device using a Master Password set by you."
    ]
  },
  {
    heading: "2. User Responsibilities",
    subSections: [
      {
        title: "a. Master Password:",
        points: [
          "You are solely responsible for creating a strong, unique Master Password and for keeping it confidential.",
          "Your Master Password is used to derive the encryption key for your User Data. We do not have access to your Master Password.",
          "If you forget your Master Password, you will permanently lose access to your User Data stored in SEEFA. We cannot recover your Master Password or your encrypted data."
        ]
      },
      {
        title: "b. Data Security and Backup:",
        points: [
          "SEEFA stores your User Data encrypted locally on your device.",
          "You are responsible for the security of your device.",
          "You are responsible for any backups of your User Data. SEEFA does not provide automated cloud backup for your encrypted vault data. Loss of your device or uninstallation of the App without a backup may result in permanent loss of your User Data."
        ]
      },
      {
        title: "c. Lawful Use:",
        paragraphs: [
          "You agree to use the App only for lawful purposes and in accordance with these Terms. You are responsible for ensuring that your use of the App complies with all applicable laws and regulations."
        ]
      },
      {
        title: "d. Accuracy of Information:",
        paragraphs: [
          "You are responsible for the accuracy of the information you store in SEEFA."
        ]
      }
    ]
  },
  {
    heading: "3. User Plans",
    subSections: [
      {
        title: "a. Free Plan:",
        paragraphs: [
          "Users on the Free Plan may store a limited number of entries as specified within the App."
        ]
      },
      {
        title: "b. Pro Plan:",
        points: [
          "Users may upgrade to a Pro Plan for a fee, which allows for the storage of unlimited entries.",
          "Payments for the Pro Plan are processed by our third-party payment processor, Paystack. Your use of Paystack is subject to Paystack's terms and privacy policy.",
          "The Pro Plan status is stored locally on your device. If you change devices or reinstall the app, you may need to contact us for plan restoration if this functionality is not automatically supported."
        ]
      }
    ]
  },
  {
    heading: "4. Intellectual Property",
    paragraphs: [
      "The App and its original content (excluding User Data), features, and functionality are and will remain the exclusive property of ShalomTech and its licensors. The App is protected by copyright, trademark, and other laws of Nigeria and other countries. Our trademarks may not be used in connection with any product or service without our prior written consent."
    ]
  },
  {
    heading: "5. Limitation of Liability",
    paragraphs: [
      "To the maximum extent permitted by law, in no event shall ShalomTech, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the App; (ii) any conduct or content of any third party on the App; (iii) any content obtained from the App; and (iv) unauthorized access, use or alteration of your transmissions or content (including your User Data), whether based on warranty, contract, tort (including negligence) or any other legal theory, whether or not we have been informed of the possibility of such damage.",
      "Because your User Data is stored locally and encrypted with a Master Password known only to you, we have no liability for any loss or corruption of your User Data, including loss due to forgotten Master Password, device malfunction, or theft."
    ]
  },
  {
    heading: "6. Disclaimer",
    paragraphs: [
      "Your use of the App is at your sole risk. The App is provided on an \"AS IS\" and \"AS AVAILABLE\" basis. The App is provided without warranties of any kind, whether express or implied, including, but not limited to, implied warranties of merchantability, fitness for a particular purpose, non-infringement, or course of performance.",
      "ShalomTech and its licensors do not warrant that (a) the App will function uninterrupted, secure or available at any particular time or location; (b) any errors or defects will be corrected; (c) the App is free of viruses or other harmful components; or (d) the results of using the App will meet your requirements."
    ]
  },
  {
    heading: "7. Governing Law",
    paragraphs: [
      "These Terms shall be governed and construed in accordance with the laws of the Federal Republic of Nigeria, without regard to its conflict of law provisions.",
      "If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions will remain in effect. These Terms constitute the entire agreement between us regarding the App."
    ]
  },
  {
    heading: "8. Changes",
    paragraphs: [
      "We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide notice prior to any new terms taking effect (e.g., via an in-app notification or by updating the \"Last Updated\" date). What constitutes a material change will be determined at our sole discretion.",
      "By continuing to access or use the App after those revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, please stop using the App."
    ]
  },
  {
    heading: "9. Contact Us",
    paragraphs: [
      "If you have any questions about these Terms, please contact us:",
      "folorunshoa08@gmail.com",
      "Taiwo Folorunsho, Founder, ShalomTech"
    ]
  }
];

const TermsOfServiceScreen: React.FC = () => {
  const theme = useTheme<AppThemeType>();
  const navigation = useNavigation();
  const styles = makeStyles(theme);
  const lastUpdatedDate = "October 26, 2023";

  return (
    <>
      <Appbar.Header style={{ backgroundColor: theme.colors.elevation.level2 }}>
        <Appbar.BackAction onPress={() => navigation.goBack()} color={theme.colors.onSurface} />
        <Appbar.Content title="Terms of Service" titleStyle={{color: theme.colors.onSurface}} />
      </Appbar.Header>
      <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text variant="titleLarge" style={[styles.importantDisclaimer, { backgroundColor: theme.colors.error, color: theme.colors.onError }]}>
          IMPORTANT DISCLAIMER: SEEFA is a local password manager. We do not store your passwords or private keys on any server. If you forget your Master Password, you will permanently lose access to your data.
        </Text>
        {TERMS_OF_SERVICE_SECTIONS.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text variant="headlineSmall" style={styles.heading}>
              {section.heading}
            </Text>
            {section.lastUpdated && (
              <Text style={styles.paragraph}>Last Updated: {lastUpdatedDate}</Text>
            )}
            {section.paragraphs?.map((paragraph, pIndex) => (
              <Text key={pIndex} style={styles.paragraph}>{paragraph}</Text>
            ))}
            {section.subSections?.map((subSection, sIndex) => (
              <View key={sIndex} style={styles.subSection}>
                {subSection.title && <Text style={styles.subHeading}>{subSection.title}</Text>}
                {subSection.paragraphs?.map((paragraph, spIndex)=>(
                    <Text key={`sp-${spIndex}`} style={styles.paragraphListItem}>{paragraph}</Text>
                ))}
                {subSection.points?.map((point, ptIndex) => (
                  <Text key={ptIndex} style={styles.listItem}>
                    {`\u2022  ${point}`}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        ))}
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
  paragraphListItem: {
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

export default TermsOfServiceScreen;