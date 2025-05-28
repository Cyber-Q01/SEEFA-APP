require('react-native-get-random-values'); // For crypto.randomUUID
console.log("Crypto object available:", typeof crypto);
import { v4 as uuidv4 } from 'uuid';
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Alert } from 'react-native';
import * as SecureStorage from '../services/secureStorage';
import * as SecureStore from 'expo-secure-store';
import { encryptData, decryptData, deriveKeyFromMasterPassword } from '../services/cryptoService';
import { Entry, UserPlan, AppDataContextType, EntryType, PasswordFormData, Web3KeyFormData, EntryFormData } from '../types';
import {
    FREE_PLAN_LIMIT, STORAGE_ENTRIES_KEY, STORAGE_PLAN_KEY,
    STORAGE_MASTER_KEY_SALT_ALIAS, STORAGE_BIOMETRICS_ENABLED_KEY, STORAGE_ENCRYPTION_KEY_ALIAS
} from '../config/constants';
import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';

const AppContext = createContext<AppDataContextType | undefined>(undefined);

const STORAGE_ENTRY_IDS_KEY = 'entry_ids'; // Key for storing entry IDs

let C_MASTER_KEY_HEX: string | null = null; // In-memory derived master key

export const AppDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [plan, setPlan] = useState<UserPlan>(UserPlan.Free);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isEncryptionKeySet, setIsEncryptionKeySet] = useState<boolean>(false); // Master password salt exists
  const [isAppLocked, setIsAppLocked] = useState<boolean>(true);

  const [isBiometricsSupported, setIsBiometricsSupported] = useState<boolean>(false);
  const [isBiometricsEnabled, setIsBiometricsEnabled] = useState<boolean>(false);

  const loadInitialDataAfterUnlock = useCallback(async (masterKeyHex: string) => {
    setIsLoading(true);
    try {
      const storedPlan = await SecureStorage.getItem(STORAGE_PLAN_KEY);
      setPlan(storedPlan === UserPlan.Pro ? UserPlan.Pro : UserPlan.Free);

      let loadedEntries: Entry[] = [];
      try {
        const entryIdsString = await SecureStorage.getItem(STORAGE_ENTRY_IDS_KEY);
        const entryIds: string[] = entryIdsString ? JSON.parse(entryIdsString) : [];

        for (const entryId of entryIds) {
          try {
            const encryptedEntry = await SecureStore.getItemAsync(`${STORAGE_ENTRIES_KEY}_${entryId}`);
            if (encryptedEntry) {
              const decryptedEntry = await decryptData<Entry>(encryptedEntry, masterKeyHex);
              loadedEntries.push(decryptedEntry);
            } else {
              console.warn(`Entry with ID ${entryId} not found in SecureStore.`);
            }
          } catch (decryptError) {
            console.error(`Failed to decrypt entry ${entryId}:`, decryptError);
          }
        }
      } catch (error) {
        console.error("Failed to load entry IDs or entries:", error);
      }

      setEntries(loadedEntries);
      // After successfully loading data, mark app as unlocked
      setIsAppLocked(false);
    } catch (error) {
      console.error("Failed to load initial data after unlock:", error);
      setEntries([]);
      setPlan(UserPlan.Free);
      setIsAppLocked(true);
      C_MASTER_KEY_HEX = null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkInitialState = useCallback(async () => {
    setIsLoading(true);
    const salt = await SecureStorage.getItem(STORAGE_MASTER_KEY_SALT_ALIAS);
    setIsEncryptionKeySet(!!salt);

    const supported = await LocalAuthentication.hasHardwareAsync() && await LocalAuthentication.isEnrolledAsync();
    setIsBiometricsSupported(supported);
    if (supported) {
      const bioEnabled = await SecureStorage.getItem(STORAGE_BIOMETRICS_ENABLED_KEY);
      setIsBiometricsEnabled(bioEnabled === 'true');
    } else {
      setIsBiometricsEnabled(false);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    checkInitialState();
  }, [checkInitialState]);

 const persistEntries = useCallback(async (updatedEntries: Entry[]) => {
    if (!C_MASTER_KEY_HEX) {
      console.warn("Master key not available. Cannot persist entries.");
      return;
    }
    try {
      // Store each entry in a separate SecureStore item
      for (const entry of updatedEntries) {
        const encryptedEntry = await encryptData(entry, C_MASTER_KEY_HEX);
        await SecureStore.setItemAsync(`${STORAGE_ENTRIES_KEY}_${entry.id}`, encryptedEntry);
      }
    } catch (error) {
      console.error("Failed to save entries:", error);
    }
  }, []);

  const persistPlan = useCallback(async (updatedPlan: UserPlan) => {
    try {
      await SecureStorage.saveItem(STORAGE_PLAN_KEY, updatedPlan);
    } catch (error) {
      console.error("Failed to save plan:", error);
    }
  }, []);

  const setMasterPasswordAndInitialize = useCallback(async (password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { keyHex: derivedKeyHex, saltHex } = await deriveKeyFromMasterPassword(password);
      if (!derivedKeyHex || !saltHex) throw new Error("Key derivation failed.");

      C_MASTER_KEY_HEX = derivedKeyHex;

      const entryIdsString = await SecureStorage.getItem(STORAGE_ENTRY_IDS_KEY);
      const entryIds: string[] = entryIdsString ? JSON.parse(entryIdsString) : [];
      let loadedEntries: Entry[] = [];

      for (const entryId of entryIds) {
        try {
          const encryptedEntry = await SecureStore.getItemAsync(`${STORAGE_ENTRIES_KEY}_${entryId}`);
          if (encryptedEntry) {
            const decryptedEntry = await decryptData<Entry>(encryptedEntry, C_MASTER_KEY_HEX);
            loadedEntries.push(decryptedEntry);
          } else {
            console.warn(`Entry with ID ${entryId} not found in SecureStore.`);
          }
        } catch (decryptError) {
          console.error(`Failed to decrypt entry:`, decryptError);
        }
      }
      setEntries(loadedEntries);

      setIsEncryptionKeySet(true);
      setIsAppLocked(false);
      return true;
    } catch (error) {
      console.error("Error setting master password:", error);
      C_MASTER_KEY_HEX = null;
      setIsAppLocked(true);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [loadInitialDataAfterUnlock]);

  const checkBiometricsAndUnlock = useCallback(async (): Promise<boolean> => {
    if (!isBiometricsSupported || !isBiometricsEnabled) return false;

    setIsLoading(true);
    let success = false;
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock SEEFA',
        disableDeviceFallback: true,
        cancelLabel: "Use Master Password"
      });

      if (result.success) {
        const storedEncryptedMasterKey = await SecureStore.getItemAsync(STORAGE_ENCRYPTION_KEY_ALIAS);
        if (storedEncryptedMasterKey) {
            C_MASTER_KEY_HEX = storedEncryptedMasterKey;
            await loadInitialDataAfterUnlock(C_MASTER_KEY_HEX);
            success = !isAppLocked;
        } else {
             console.warn("Biometrics success, but Fallback to password.");
             setIsBiometricsEnabled(false);
             await SecureStore.deleteItemAsync(STORAGE_BIOMETRICS_ENABLED_KEY);
        }
      } else {
        // Biometric authentication failed or was cancelled by user
      }
    } catch (error) {
      console.error("Error during biometric unlock:", error);
    } finally {
      setIsLoading(false);
    }
    return success;
  }, [isBiometricsSupported, isBiometricsEnabled]);


  const addEntry = useCallback(async (entryData: EntryFormData, type: EntryType): Promise<boolean> => {
    if (!C_MASTER_KEY_HEX) return false;
    if (plan === UserPlan.Free && entries.length >= FREE_PLAN_LIMIT) {
        console.warn("Free plan limit reached. Cannot add more entries.");
        return false;
    }
    const newEntry: Entry = {
      id: uuidv4(),
      type,
      ...entryData,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    } as Entry;

    const updatedEntries = [...entries, newEntry];
    setEntries(updatedEntries);
    try {
      await persistEntries([newEntry]); // Persist only the new entry

      // Update entry IDs
      const entryIds = updatedEntries.map(entry => entry.id);
      await SecureStorage.saveItem(STORAGE_ENTRY_IDS_KEY, JSON.stringify(entryIds));

      return true;
    } catch (error) {
      console.error("Failed to add entry:", error);
      return false;
    }
  }, [entries, plan, persistEntries]);

  const updateEntry = useCallback(async (id: string, entryData: Partial<EntryFormData>): Promise<boolean> => {
    if (!C_MASTER_KEY_HEX) return false;
    const updatedEntries = entries.map(entry =>
      entry.id === id ? { ...entry, ...entryData, updatedAt: Date.now() } : entry
    );
    setEntries(updatedEntries);
    try {
      const updatedEntry = updatedEntries.find(entry => entry.id === id);
      if (updatedEntry) {
        await persistEntries([updatedEntry]); // Persist only the updated entry
      }
      // Update entry IDs
      const entryIds = updatedEntries.map(entry => entry.id);
      await SecureStorage.saveItem(STORAGE_ENTRY_IDS_KEY, JSON.stringify(entryIds));
      return true;
    } catch (error) {
      console.error("Failed to update entry:", error);
      return false;
    }
  }, [entries, persistEntries]);

  const deleteEntry = useCallback(async (id: string): Promise<void> => {
    if (!C_MASTER_KEY_HEX) return;
    const updatedEntries = entries.filter(entry => entry.id !== id);
    setEntries(updatedEntries);
    try {
      // Delete the SecureStore item for the deleted entry
      await SecureStore.deleteItemAsync(`${STORAGE_ENTRIES_KEY}_${id}`);

      // Update entry IDs
      const entryIds = updatedEntries.map(entry => entry.id);
      await SecureStorage.saveItem(STORAGE_ENTRY_IDS_KEY, JSON.stringify(entryIds));
    } catch (error) {
      console.error("Failed to delete entry:", error);
    }
  }, [entries, persistEntries]);

  const getEntryById = useCallback((id: string): Entry | undefined => {
    return entries.find(entry => entry.id === id);
  }, [entries]);

  const upgradeToPro = useCallback(async (): Promise<void> => {
    setPlan(UserPlan.Pro);
    await persistPlan(UserPlan.Pro);
  }, [persistPlan]);

  const lockApp = useCallback(() => {
    C_MASTER_KEY_HEX = null; 
    setIsAppLocked(true);
  }, []);

  const unlockApp = useCallback(async (password?: string): Promise<boolean> => {
     if (!password) { 
        return false;
     }
     setIsLoading(true);
     try {
        const { keyHex } = await deriveKeyFromMasterPassword(password);
        C_MASTER_KEY_HEX = keyHex;
        await loadInitialDataAfterUnlock(C_MASTER_KEY_HEX);
        return !isAppLocked; 
     } catch (error) {
        console.error("Failed to unlock with password:", error);
        C_MASTER_KEY_HEX = null;
        setIsAppLocked(true);
        return false;
     } finally {
        setIsLoading(false);
     }
  }, [loadInitialDataAfterUnlock, isAppLocked]);


  const toggleBiometrics = useCallback(async (enable: boolean, masterPassword?: string): Promise<boolean> => {
    if (!isBiometricsSupported) return false;

    setIsLoading(true);
    try {
        if (enable) {
            if (!masterPassword) {
                console.warn("Master password required to enable biometrics.");
                return false;
            }
            
            const { keyHex: currentMasterKeyHex } = await deriveKeyFromMasterPassword(masterPassword);
            if (!C_MASTER_KEY_HEX) {
                 C_MASTER_KEY_HEX = currentMasterKeyHex;
            } else if (C_MASTER_KEY_HEX !== currentMasterKeyHex) {
                console.error("Master password verification failed for enabling biometrics.");
                return false;
            }
            
            await SecureStore.setItemAsync(STORAGE_ENCRYPTION_KEY_ALIAS, C_MASTER_KEY_HEX);
            await SecureStorage.saveItem(STORAGE_BIOMETRICS_ENABLED_KEY, 'true');
            setIsBiometricsEnabled(true);
            return true;
        } else {
            await SecureStore.deleteItemAsync(STORAGE_ENCRYPTION_KEY_ALIAS);
            await SecureStorage.saveItem(STORAGE_BIOMETRICS_ENABLED_KEY, 'false');
            setIsBiometricsEnabled(false);
            return true;
        }
    } catch (error) {
        console.error(`Failed to ${enable ? 'enable' : 'disable'} biometrics:`, error);
        if (enable) {
            await SecureStorage.saveItem(STORAGE_BIOMETRICS_ENABLED_KEY, 'false');
            setIsBiometricsEnabled(false);
        }
        return false;
    } finally {
        setIsLoading(false);
    }
  }, [isBiometricsSupported]);

  const changeMasterPassword = useCallback(async (currentPassword: string, newPassword: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      if (!C_MASTER_KEY_HEX) {
        console.warn("Master key not available. Cannot change master password.");
        return false;
      }

      const { keyHex: currentKeyHex } = await deriveKeyFromMasterPassword(currentPassword);
      if (C_MASTER_KEY_HEX !== currentKeyHex) {
        Alert.alert("Error", "Incorrect current master password.");
        return false;
      }

      const { keyHex: newKeyHex, saltHex } = await deriveKeyFromMasterPassword(newPassword);
      if (!newKeyHex || !saltHex) {
        console.error("Failed to derive new master key.");
        return false;
      }

      // Re-encrypt all entries with the new key
      const encryptedEntries = await encryptData(entries, newKeyHex);
      await SecureStore.setItemAsync(STORAGE_ENTRIES_KEY, encryptedEntries);

      // Update the master key in memory and secure storage
      C_MASTER_KEY_HEX = newKeyHex;
      await SecureStore.setItemAsync(STORAGE_ENCRYPTION_KEY_ALIAS, C_MASTER_KEY_HEX);

      Alert.alert("Success", "Master password changed successfully.");
      return true;
    } catch (error) {
      console.error("Failed to change master password:", error);
      Alert.alert("Error", "Failed to change master password. Please try again.");
      return false;
    } finally {
      setIsLoading(false);
    }
    
  }, [entries]);


  const contextValue: AppDataContextType = {
    entries,
    addEntry,
    updateEntry,
    deleteEntry,
    getEntryById,
    plan,
    upgradeToPro,
    isLoading,
    isLimitReached: plan === UserPlan.Free && entries.length >= FREE_PLAN_LIMIT,
    isEncryptionKeySet,
    setMasterPasswordAndInitialize,
    isAppLocked,
    unlockApp,
    lockApp,
    checkBiometricsAndUnlock,
    isBiometricsSupported,
    isBiometricsEnabled,
    toggleBiometrics,
    changeMasterPassword,
    isLocked: isAppLocked,
    setIsLocked: setIsAppLocked,
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};

export const useAppData = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppDataProvider');
  }
  return context;
};
