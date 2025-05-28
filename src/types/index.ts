export enum EntryType {
  Password = 'password',
  Web3Key = 'web3key',
}

export interface BaseEntry {
  id: string;
  type: EntryType;
  createdAt: number;
  updatedAt: number;
}

// Fields that will be encrypted
export interface PasswordEntrySensitive {
  passwordValue: string;
}

export interface PasswordEntryNonSensitive extends BaseEntry {
  type: EntryType.Password;
  appName: string;
  username: string;
  websiteUrl?: string;
  category?: string;
}

export type PasswordEntry = PasswordEntryNonSensitive & PasswordEntrySensitive;

// Fields that will be encrypted
export interface Web3KeyEntrySensitive {
  secretPhrase?: string;
  secretKey?: string;
  pinCode?: string;
}
export interface Web3KeyEntryNonSensitive extends BaseEntry {
  type: EntryType.Web3Key;
  label: string; // "My Main ETH Wallet"
  walletName: string; // "MetaMask, Trust Wallet"
  projectName?: string; // "CryptoPunks"
  websiteUrl?: string;
  category?: string;
}

export type Web3KeyEntry = Web3KeyEntryNonSensitive & Web3KeyEntrySensitive;

export type Entry = PasswordEntry | Web3KeyEntry;

// For forms, before encryption and full object creation
export type PasswordFormData = Omit<PasswordEntry, 'id' | 'type' | 'createdAt' | 'updatedAt'>;
export type Web3KeyFormData = Omit<Web3KeyEntry, 'id' | 'type' | 'createdAt' | 'updatedAt'>;
export type EntryFormData = PasswordFormData | Web3KeyFormData;


export enum UserPlan {
  Free = 'free',
  Pro = 'pro',
}

export interface AppDataContextType {
  entries: Entry[];
  addEntry: (entryData: EntryFormData, type: EntryType) => Promise<boolean>;
  updateEntry: (id: string, entryData: Partial<EntryFormData>) => Promise<boolean>;
  deleteEntry: (id: string) => Promise<void>;
  getEntryById: (id: string) => Entry | undefined;
  plan: UserPlan;
  upgradeToPro: () => Promise<void>;
  isLoading: boolean;
  isLimitReached: boolean;
  isEncryptionKeySet: boolean;
  setMasterPasswordAndInitialize: (password: string) => Promise<boolean>; 
  isAppLocked: boolean;
  unlockApp: (password?: string) => Promise<boolean>; 
  lockApp: () => void;
  checkBiometricsAndUnlock: () => Promise<boolean>;
  isBiometricsSupported: boolean;
  isBiometricsEnabled: boolean;
  isLocked: boolean;
  setIsLocked: (isLocked: boolean) => void;
  toggleBiometrics: (enable: boolean, masterPassword?: string) => Promise<boolean>;
  changeMasterPassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
}

// For Paystack webview
export type PaystackEvent =
  | { eventType: 'onSuccess'; data?: any }
  | { eventType: 'onClose' }
  | { eventType: 'onLoad' }
  | { eventType: 'onError'; data?: any };
