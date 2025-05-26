
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
  label: string;
  walletName: string;
  projectName?: string;
  secretPhrase?: string;
  secretKey?: string;
  pinCode?: string;
  websiteUrl?: string;
  category?: string;
}

export type Entry = PasswordEntry | Web3KeyEntry;

export enum UserPlan {
  Free = 'free',
  Pro = 'pro',
}

export interface AppContextType {
  entries: Entry[];
  addEntry: (entry: Omit<PasswordEntry, 'id' | 'type' | 'createdAt'> | Omit<Web3KeyEntry, 'id' | 'type' | 'createdAt'>, type: EntryType) => boolean;
  updateEntry: (updatedEntry: Entry) => void;
  deleteEntry: (id: string) => void;
  plan: UserPlan;
  upgradeToPro: () => void;
  getEntryById: (id: string) => Entry | undefined;
  isLoading: boolean;
}

export type PaystackProps = {
  email: string;
  amount: number;
  publicKey: string;
  onSuccess: () => void;
  onClose: () => void;
};
