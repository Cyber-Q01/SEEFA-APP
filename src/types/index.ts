/**
 * Enum for entry types in the vault.
 * - Password: Standard password entry.
 * - Web3Key: Web3 wallet/private key entry.
 */
export enum EntryType {
  Password = 'password',
  Web3Key = 'web3key',
}

/**
 * Base fields for all entries (shared).
 */
export interface BaseEntry {
  id: string;           // Unique identifier for the entry
  type: EntryType;      // Type of entry (password or web3key)
  createdAt: number;    // Timestamp of creation
  updatedAt: number;    // Timestamp of last update
}

/**
 * Fields that are sensitive and should be encrypted for password entries.
 */
export interface PasswordEntrySensitive {
  passwordValue: string; // The actual password (encrypted)
}

/**
 * Non-sensitive fields for password entries.
 */
export interface PasswordEntryNonSensitive extends BaseEntry {
  type: EntryType.Password;
  appName: string;      // Name of the app or website
  username: string;     // Username or email for login
  websiteUrl?: string;  // Optional website URL
  category?: string;    // Optional category (e.g., Social, Banking)
}

/**
 * Full password entry type (combines sensitive and non-sensitive).
 */
export type PasswordEntry = PasswordEntryNonSensitive & PasswordEntrySensitive;

/**
 * Fields that are sensitive and should be encrypted for Web3 key entries.
 */
export interface Web3KeyEntrySensitive {
  secretPhrase?: string; // Optional secret phrase (encrypted)
  secretKey?: string;    // Optional secret key (encrypted)
  pinCode?: string;      // Optional PIN code (encrypted)
}

/**
 * Non-sensitive fields for Web3 key entries.
 */
export interface Web3KeyEntryNonSensitive extends BaseEntry {
  type: EntryType.Web3Key;
  label: string;         // User label for the key (e.g., "My Main ETH Wallet")
  walletName: string;    // Wallet provider name (e.g., "MetaMask")
  projectName?: string;  // Optional project name (e.g., "CryptoPunks")
  websiteUrl?: string;   // Optional website URL
  category?: string;     // Optional category
}

/**
 * Full Web3 key entry type (combines sensitive and non-sensitive).
 */
export type Web3KeyEntry = Web3KeyEntryNonSensitive & Web3KeyEntrySensitive;

/**
 * Union type for any entry in the vault.
 */
export type Entry = PasswordEntry | Web3KeyEntry;

/**
 * Form data types for creating or editing entries (before encryption and ID assignment).
 */
export type PasswordFormData = Omit<PasswordEntry, 'id' | 'type' | 'createdAt' | 'updatedAt'>;
export type Web3KeyFormData = Omit<Web3KeyEntry, 'id' | 'type' | 'createdAt' | 'updatedAt'>;
export type EntryFormData = PasswordFormData | Web3KeyFormData;

/**
 * Enum for user plan types.
 */
export enum UserPlan {
  Free = 'free',
  Pro = 'pro',
}

/**
 * Context type for app data, used in AppDataContext.
 */
export interface AppDataContextType {
  entries: Entry[]; // All vault entries
  addEntry: (...args: any[]) => Promise<boolean>; // Add a new entry
  updateEntry: (...args: any[]) => Promise<boolean>; // Update an entry
  deleteEntry: (id: string) => Promise<void>; // Delete an entry by ID
  getEntryById: (id: string) => Entry | undefined; // Get entry by ID
  plan: UserPlan; // Current user plan
  isPro: boolean; // Is user on Pro plan
  isLoading: boolean; // Is app data loading
  isLimitReached: boolean; // Has user reached free plan limit
  isEncryptionKeySet: boolean; // Is encryption key set
  setMasterPasswordAndInitialize: (password: string) => Promise<boolean>; // Set master password
  isAppLocked: boolean; // Is app locked
  unlockApp: (password?: string) => Promise<boolean>; // Unlock app
  lockApp: () => void; // Lock app
  checkBiometricsAndUnlock: () => Promise<boolean>; // Try biometric unlock
  isBiometricsSupported: boolean; // Is biometrics supported on device
  isBiometricsEnabled: boolean; // Is biometrics enabled
  toggleBiometrics: (enable: boolean, masterPassword?: string) => Promise<boolean>; // Enable/disable biometrics
  changeMasterPassword: (currentPassword: string, newPassword: string) => Promise<boolean>; // Change master password
  isLocked: boolean; // Is app currently locked
  setIsLocked: (locked: boolean) => void; // Set lock state
}

/**
 * Paystack event types for payment webview integration.
 */
export type PaystackEvent =
  | { eventType: 'onSuccess'; data?: any }
  | { eventType: 'onClose' }
  | { eventType: 'onLoad' }
  | { eventType: 'onError'; data?: any };
