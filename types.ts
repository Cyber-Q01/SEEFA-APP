export enum EntryType {
  Password = 'password',
  Web3Key = 'web3key',
}

export interface BaseEntry {
  id: string;
  type: EntryType;
  createdAt: number;
}

export interface PasswordEntry extends BaseEntry {
  type: EntryType.Password;
  appName: string;
  username: string;
  passwordValue: string;
  websiteUrl?: string;
  category?: string;
}

export interface Web3KeyEntry extends BaseEntry {
  type: EntryType.Web3Key;
  appName: string;
  address: string;
  privateKey: string;
  network?: string;
  category?: string;
}

export type Entry = PasswordEntry | Web3KeyEntry;

export enum UserPlan {
  Free = 'free',
  Pro = 'pro',
}

export interface AppDataContextType {
  entries: Entry[];
  addEntry: (entry: Omit<PasswordEntry, 'id' | 'type' | 'createdAt'> | Omit<Web3KeyEntry, 'id' | 'type' | 'createdAt'>, type: EntryType) => boolean;
  updateEntry: (updatedEntry: Entry) => void;
  deleteEntry: (id: string) => void;
  plan: UserPlan;
  upgradeToPro: () => void;
  getEntryById: (id: string) => Entry | undefined;
  isLoading: boolean;
  isEncryptionKeySet: boolean;
  setMasterPasswordAndInitialize: (password: string) => Promise<boolean>;
  isAppLocked: boolean;
  unlockApp: (password?: string) => Promise<boolean>;
  lockApp: () => void;
  checkBiometricsAndUnlock: () => Promise<boolean>;
  isBiometricsSupported: boolean;
  isBiometricsEnabled: boolean;
  toggleBiometrics: (enable: boolean, masterPassword?: string) => Promise<boolean>;
  changeMasterPassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
}
