
# SEEFA - Secure Password & Web3 Key Manager

SEEFA is a React Native Expo application designed to securely manage your passwords and Web3 private keys locally on your device. It features robust encryption, biometric authentication, and a monetization model with a Pro plan unlockable via Paystack.

## Core Features

1.  **Secure Local Storage:**
    *   Add, view, edit, and delete regular password entries and Web3 private key entries.
    *   All sensitive data is encrypted at rest using AES-256.
    *   Encryption keys are derived from a user-set master password.
    *   Utilizes `expo-secure-store` (iOS Keychain / Android EncryptedSharedPreferences) for storing the encrypted data and the salt for key derivation.
2.  **Master Password Protection:**
    *   The app requires a master password to be set up on first use. This password is used to derive the encryption key for all data.
    *   **Crucial:** This master password is the *only* way to access your data. If forgotten, the data is irrecoverable.
3.  **Biometric Authentication (Optional):**
    *   Supports unlocking the app using device biometrics (Face ID, Touch ID, Fingerprint) via `expo-local-authentication`.
    *   The master encryption key can be stored in the secure enclave (protected by biometrics) for quick and secure access after initial master password entry.
4.  **Monetization:**
    *   **Free Plan:** Users are limited to a maximum of 5 total saved entries (passwords + Web3 keys combined).
    *   **Pro Plan:** Unlock unlimited entries after a one-time payment (₦4800) via Paystack.
    *   Pro status is persisted locally and securely.
5.  **User Interface:**
    *   Modern, purple-themed digital card layout for entries.
    *   Uses `react-native-paper` for UI components.
    *   Intuitive navigation and user experience.

## Technology Stack

*   **Framework:** React Native (with Expo)
*   **UI Library:** React Native Paper
*   **Navigation:** React Navigation (Stack Navigator)
*   **Secure Storage:** `expo-secure-store`
*   **Encryption:** `crypto-js` (AES-256 for data, PBKDF2 for key derivation)
*   **Biometrics:** `expo-local-authentication`
*   **State Management:** React Context API
*   **Language:** TypeScript

## Prerequisites

*   Node.js (LTS version recommended)
*   npm or yarn
*   Expo CLI: `npm install -g expo-cli`
*   Expo Go app on your iOS or Android device (for testing on physical devices)
*   Android Studio (for Android emulator) or Xcode (for iOS simulator) - Optional, for emulator/simulator testing.

## Setup & Installation

1.  **Clone the repository or download the ZIP and extract it.** (You've likely already done this if you have the existing files.)
2.  **Navigate to the project directory:**
    ```bash
    cd /path/to/your-project-directory
    ```
    (Replace `/path/to/your-project-directory` with the actual path to your `seefa-app` or similarly named folder where `package.json` is located.)
3.  **Install dependencies (if you haven't already or if `node_modules` is missing):**
    ```bash
    npm install
    # OR
    yarn install
    ```

## How to Run the App

1.  **Start the Metro Bundler (Expo Development Server):**
    ```bash
    npx expo start
    ```
2.  **Options to run:**
    *   **On a physical device:** Scan the QR code displayed in the terminal or browser using the Expo Go app on your Android or iOS device.
    *   **On an Android emulator:** Press `a` in the terminal (requires Android Studio and a configured emulator).
    *   **On an iOS simulator:** Press `i` in the terminal (requires Xcode and a configured simulator - macOS only).
    *   **In a web browser (for limited preview):** Press `w` in the terminal. Note that this app is primarily designed for mobile, and web compatibility for all native features might vary. The `index.html` you have is a placeholder.

## Security Implementation

*   **Master Password:** The first line of defense. Used to derive the main encryption key via PBKDF2 with a unique salt per installation.
*   **Salt:** A unique salt for PBKDF2 is generated and stored in `expo-secure-store` (`STORAGE_MASTER_KEY_SALT_ALIAS`).
*   **AES-256 Encryption:** All `Entry` data (passwords, web3 keys) is serialized to JSON and then encrypted using AES-256 CBC mode with a unique IV per encryption operation. The IV is prepended to the ciphertext.
*   **Encrypted Data Storage:** The resulting `[IV+Ciphertext]` (Base64 encoded) is stored in `expo-secure-store` under the `STORAGE_ENTRIES_KEY`.
*   **Biometric Key Storage:** If biometrics are enabled, the derived master encryption key (C_MASTER_KEY_HEX) itself is stored in `expo-secure-store` protected by biometric authentication (`STORAGE_ENCRYPTION_KEY_ALIAS`). This allows unlocking the app without re-entering the master password every time, while still keeping the key highly secure.
*   **No Plaintext Secrets:** Sensitive data is never stored in plaintext.

## Paystack Integration

*   The app now uses payment links generated from the Paystack dashboard to handle payments.
*   To process payments, generate a payment link from your Paystack dashboard and paste it into the `paymentLink` variable in the `src/screens/UpgradeScreen.tsx` file.
*   **WARNING - LIVE KEY IN USE:** The Paystack public key currently configured in `src/config/constants.ts` is `pk_live_b6a7405c6aa130017c2c4cfea16192702bcff3ae`. **This is a LIVE key.**
    *   **Transactions made with this key will be REAL and will charge actual money.**
    *   For development and testing, it is **STRONGLY RECOMMENDED** to replace this with your **Paystack Test Public Key** from your Paystack dashboard.
    *   Ensure your Paystack account (live or test) is correctly set up to accept payments.

## Project Structure (Based on your provided files)

Your project seems to have root files for web (`index.html`, `index.tsx`, `types.ts`, `ui.tsx`) and an Expo app structure (`App.tsx`, `src/`, `assets/`, `app.json`, etc.). This README focuses on the Expo React Native application.

```
your-project-root/
├── assets/                 # Static assets (icons, splash screen)
├── src/
│   ├── components/         # Reusable UI components (PasswordCard, Web3KeyCard, etc.)
│   ├── config/             # App configuration (constants, theme)
│   ├── contexts/           # React Context for global state (AppDataContext)
│   ├── navigation/         # Navigation setup (AppNavigator)
│   ├── screens/            # Top-level screen components (HomeScreen, AddEditEntryScreen, etc.)
│   ├── services/           # Services (cryptoService, secureStorage)
│   └── types/index.ts      # TypeScript type definitions for the Expo app
├── App.tsx                 # Main app entry point for Expo
├── app.json                # Expo configuration file
├── babel.config.js         # Babel configuration
├── package.json            # Project dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── index.html              # (Web placeholder)
├── index.tsx               # (Web placeholder)
├── types.ts                # (Likely for web part, distinct from src/types/index.ts)
├── ui.tsx                  # (Likely for web part)
└── README.md               # This file
```

## What You Need To Do Next (Action Items)

1.  **Paystack Key Management (CRITICAL):**
    *   **Decide on Live vs. Test Key:** If you are not ready for live transactions, replace `pk_live_b6a7405c6aa130017c2c4cfea16192702bcff3ae` in `src/config/constants.ts` with your **Paystack Test Public Key**.
    *   **Verify Paystack Account:** Ensure your Paystack dashboard (for the key you are using) is correctly configured (e.g., bank account for payouts if live, webhook configurations if needed later).
2.  **EAS Project ID (Optional - for EAS Build):**
    *   If you plan to use EAS Build for creating standalone app binaries, replace `"your-eas-project-id"` in `app.json` under `extra.eas.projectId` with your actual EAS project ID. You can create one on the [Expo dashboard](https://expo.dev).
3.  **Replace Placeholder Assets:**
    *   Update the icons and splash screen in the `assets/` directory (e.g., `icon.png`, `splash.png`). Refer to your `app.json` for the exact paths used.
4.  **Thorough Testing:**
    *   Test all functionalities: adding, editing, deleting entries (both password and Web3).
    *   Test the free plan limit.
    *   **Crucially, test the Paystack payment flow.** If using the live key, consider making a small real transaction you can refund, or switch to test keys for comprehensive payment testing.
    *   Test master password setup and app lock/unlock.
    *   Test biometric authentication setup and usage on compatible devices.
5.  **Review App Configuration:**
    *   Check `app.json` for other configurations like `name`, `slug`, `ios.bundleIdentifier`, `android.package` and update them to match your desired app identity.
6.  **Security Review (Master Password Flow):**
    *   Understand the master password flow. The current setup is for local encryption. For advanced needs, you might explore more complex key management or backup strategies (which are outside the current scope).
7.  **Clean up Web-Specific Files (Optional):**
    *   If you are *only* focusing on the React Native mobile app, you might consider removing or archiving `index.html`, `index.tsx` (the root one), `types.ts` (the root one), and `ui.tsx` to avoid confusion, as they seem to be from a previous web-based iteration. The Expo app uses `App.tsx` as its entry and `src/types/index.ts` for its typings.
8.  **Build and Deploy (When Ready):**
    *   Use EAS Build for creating production builds: `eas build -p android` or `eas build -p ios`.
    *   Submit to app stores following their guidelines.

## Future Improvements (Conceptual)

*   **Master Password Change:** Implement a secure way to change the master password, which would involve re-encrypting all stored data with a key derived from the new password.
*   **Secure Data Export/Import:** Allow users to export their encrypted data (e.g., for backup) and import it back. This would require careful design to maintain security.
*   **Advanced Password Generator.**
*   **Security Audit/Password Strength Check for saved entries.**
*   **Customizable Categories/Tags.**
*   **Cloud Sync (Optional & Highly Secure):** If considering cloud sync, it would need end-to-end encryption where the cloud provider cannot access the plaintext data. This is a significant feature requiring careful security architecture.

---

This README should help you get started and understand the key aspects of the SEEFA application. Remember to handle the Paystack live key with care!
