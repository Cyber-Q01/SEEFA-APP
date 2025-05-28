

import React from 'react';
// Fix: Added 'View' to import from 'react-native'
import { ScrollView, StyleSheet, View } from 'react-native';
// Fix: Removed 'View' from react-native-paper import
import { Text, useTheme, Appbar, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { AppThemeType } from '../config/theme';

// IMPORTANT: This is a TEMPLATE. Review and customize with a legal professional.
const TERMS_OF_SERVICE_SECTIONS = [
  {
    heading: "Terms of Service for SEEFA",
    lastUpdated: true,
    paragraphs: [
      "Please read these Terms of Service (\"Terms,\" \"Terms of Service\") carefully before using the SEEFA mobile application (the \"Service,\" \"App\") operated by ShalomTech (\"us,\" \"we,\" or \"our\").",
      "Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms. These Terms apply to all visitors, users, and others who access or use theService.",
      "By accessing or using the Service, you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access the Service."
    ],
  },
  {
    heading: "1. Description of Service",
    paragraphs: [
      "SEEFA is a mobile application designed to allow users to securely store, manage, and access passwords, Web3 private keys, and related information (\"User Data\") locally on their own mobile devices. All User Data is encrypted on the user's device using a Master Password set by the user."
    ]
  },
  {
    heading: "2. User Responsibilities",
    subSections: [
      {
        title: "a. Master Password:",
        points: [
          "You are solely responsible for creating a strong, unique Master Password and for maintaining its confidentiality.",
          "Your Master Password is used to derive the encryption key for your User Data. We do not have access to your Master Password.",
          "**IF YOU FORGET YOUR MASTER PASSWORD, YOU WILL PERMANENTLY LOSE ACCESS TO YOUR USER DATA STORED IN SEEFA. WE CANNOT RECOVER YOUR MASTER PASSWORD OR YOUR ENCRYPTED DATA.**"
        ]
      },
      {
        title: "b. Data Security and Backup:",
        points: [
          "SEEFA stores your User Data encrypted locally on your device.",
          "You are responsible for the security of your own device.",
          "You are responsible for any backups of your User Data. SEEFA does not provide an automated cloud backup service for your encrypted vault data. Loss of your device or uninstallation of the App without a separate backup may result in permanent loss of your User Data."
        ]
      },
      {
        title: "c. Lawful Use:",
        paragraphs: [ // Using paragraphs here for prose-like content
            "You agree to use the Service only for lawful purposes and in accordance with these Terms. You are responsible for ensuring that your use of the Service to store any particular information is compliant with all applicable laws and regulations."
        ]
      },
      {
        title: "d. Accuracy of Information:",
        paragraphs: ["You are responsible for the accuracy of the information you store in SEEFA."]
      }
    ]
  },
  {
    heading: "3. User Plans",
    subSections: [
      {
        title: "a. Free Plan:",
        paragraphs: ["Users on the Free Plan may store a limited number of entries as specified within the App (currently 5 entries)."]
      },
      {
        title: "b. Pro Plan:",
        points: [
          "Users may upgrade to a Pro Plan for a one-time fee, which allows for the storage of unlimited entries.",
          // Corrected broken string and removed 'onSurfaceVariant: any;'
          "Payments for the Pro Plan are processed by our third-party payment processor, Paystack. Your use of Paystack is subject to Paystack's terms and conditions and privacy policy.",
          "The Pro Plan status is stored locally on your device. If you change devices or reinstall the app, you may need to contact us for plan restoration if this functionality is not automatically supported (currently, plan restoration is not explicitly implemented beyond local storage)."
        ]
      }
    ]
  },
  {
    heading: "4. Intellectual Property",
    paragraphs: [
      "The Service and its original content (excluding User Data), features, and functionality are and will remain the exclusive property of [Your Business Name/Developer Name] and its licensors. The Service is protected by copyright, trademark, and other laws of both Nigeria and foreign countries. Our trademarks and trade dress may not be used in connection with any product or service without our prior written consent."
    ]
  },
  {
    heading: "5. Limitation of Liability",
    paragraphs: [
      "TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL ShalomTech, NOR ITS DIRECTORS, EMPLOYEES, PARTNERS, AGENTS, SUPPLIERS, OR AFFILIATES, BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM (I) YOUR ACCESS TO OR USE OF OR INABILITY TO ACCESS OR USE THE SERVICE; (II) ANY CONDUCT OR CONTENT OF ANY THIRD PARTY ON THE SERVICE; (III) ANY CONTENT OBTAINED FROM THE SERVICE; AND (IV) UNAUTHORIZED ACCESS, USE OR ALTERATION OF YOUR TRANSMISSIONS OR CONTENT (INCLUDING YOUR USER DATA), WHETHER BASED ON WARRANTY, CONTRACT, TORT (INCLUDING NEGLIGENCE) OR ANY OTHER LEGAL THEORY, WHETHER OR NOT WE HAVE BEEN INFORMED OF THE POSSIBILITY OF SUCH DAMAGE, AND EVEN IF A REMEDY SET FORTH HEREIN IS FOUND TO HAVE FAILED OF ITS ESSENTIAL PURPOSE.",
      "OUR MAXIMUM AGGREGATE LIABILITY TO YOU FOR ANY CAUSE WHATSOEVER, AND REGARDLESS OF THE FORM OF THE ACTION, WILL AT ALL TIMES BE LIMITED TO THE AMOUNT PAID, IF ANY, BY YOU TO US FOR THE SERVICE DURING THE TWELVE (12) MONTHS PRIOR TO THE ACTION GIVING RISE TO LIABILITY (OR, IF NO AMOUNT WAS PAID, TO NGN 5,000 (FIVE THOUSAND NAIRA)).",
      "BECAUSE YOUR USER DATA IS STORED LOCALLY AND ENCRYPTED WITH A MASTER PASSWORD KNOWN ONLY TO YOU, WE HAVE NO LIABILITY FOR ANY LOSS OR CORRUPTION OF YOUR USER DATA, INCLUDING LOSS DUE TO FORGOTTEN MASTER PASSWORD, DEVICE MALFUNCTION, OR THEFT."
    ]
  },
  {
    heading: "6. Disclaimer",
    paragraphs: [
      "Your use of the Service is at your sole risk. The Service is provided on an \"AS IS\" and \"AS AVAILABLE\" basis. The Service is provided without warranties of any kind, whether express or implied, including, but not limited to, implied warranties of merchantability, fitness for a particular purpose, non-infringement, or course of performance.",
      "[Your Business Name/Developer Name] its subsidiaries, affiliates, and its licensors do not warrant that a) the Service will function uninterrupted, secure or available at any particular time or location; b) any errors or defects will be corrected; c) the Service is free of viruses or other harmful components; or d) the results of using the Service will meet your requirements."
    ]
  },
  {
    heading: "7. Governing Law",
    paragraphs: [
      "These Terms shall be governed and construed in accordance with the laws of the Federal Republic of Nigeria, without regard to its conflict of law provisions.",
      "Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights. If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of these Terms will remain in effect. These Terms constitute the entire agreement between us regarding our Service and supersede and replace any prior agreements we might have between us regarding the Service."
    ]
  },
  {
    heading: "8. Changes",
    paragraphs: [
      "We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days' notice prior to any new terms taking effect (e.g., via an in-app notification or by updating the \"Last Updated\" date). What constitutes a material change will be determined at our sole discretion.",
      "By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, please stop using the Service."
    ]
  },
  {
    heading: "9. Contact Us",
    paragraphs: [
      "If you have any questions about these Terms, please contact us:",
      "[Your Email Address for Support/Legal Inquiries - e.g., support@seefa.app]",
      "[Your Business Name/Developer Name, if applicable]",
      "[Your Business Address, if applicable]",
    ]
  },
  {
    heading: "Legal Disclaimer",
    paragraphs: [
        "The contents of these Terms of Service are for informational purposes only and do not constitute legal advice. You should consult with a qualified legal professional to ensure compliance with all applicable laws and regulations for your specific circumstances."
    ],
    isDisclaimer: true,
  }
];

const TermsOfServiceScreen: React.FC = () => {
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
        <Appbar.Content title="Terms of Service" titleStyle={{color: theme.colors.onSurface}} />
      </Appbar.Header>
      {/* Fix: Color properties will be valid after theme.ts fixes. */}
      <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.importantDisclaimer, {color: theme.colors.error, backgroundColor: theme.colors.errorContainer}]}>
            IMPORTANT: This is a template. Review and customize with a legal professional before use.
        </Text>
        {TERMS_OF_SERVICE_SECTIONS.map((section, index) => (
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
            {section.subSections?.map((subSection, sIndex) => (
              <View key={sIndex} style={styles.subSection}>
                {subSection.title && <Text style={styles.subHeading}>{subSection.title}</Text>}
                {subSection.paragraphs?.map((paragraph, spIndex)=>(
                    <Text key={`sp-${spIndex}`} style={styles.paragraphListItem}>{paragraph}</Text>
                ))}
                {subSection.points?.map((point, ptIndex) => (
                  <Text key={ptIndex} style={styles.listItem}>
                    {`\u2022  ${point.includes("**") ? point.split("**").map((textPart, i) => (
                        <Text key={i} style={i % 2 === 1 ? styles.boldText : {}}>{textPart}</Text>
                    )) : point}`}
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
      color: theme.colors.onSurface, // Make bold text more prominent
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
  paragraphListItem: { // For paragraphs within a subsection that are not bullet points
    // Fix: Color property will be valid after theme.ts fixes.
    color: theme.colors.onSurfaceVariant,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 5,
    textAlign: 'justify',
    // marginLeft: -10, // Optional: if you want paragraphs to align with section text, not bullet points
  },
  closeButton: {
    marginVertical: 24,
    alignSelf: 'center',
    // Fix: Color property will be valid after theme.ts fixes.
    borderColor: theme.colors.primary,
  }
});

export default TermsOfServiceScreen;