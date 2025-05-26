

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import * as SecureStorage from '../services/secureStorage';
import { encryptData, decryptData, deriveKeyFromMasterPassword } from '../services/cryptoService';
import { Entry, UserPlan, AppDataContextType, EntryType, PasswordFormData, Web3KeyFormData, EntryFormData } from '../types';
import {
    FREE_PLAN_LIMIT, STORAGE_ENTRIES_KEY, STORAGE_PLAN_KEY,
    STORAGE_MASTER_KEY_SALT_ALIAS, STORAGE_BIOMETRICS_ENABLED_KEY, STORAGE_ENCRYPTION_KEY_ALIAS
} from '../config/constants';
import *
as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';
// Fix: Import KeychainAccessibility directly if it's a named export.
import { KeychainAccessibility } from 'expo-secure-store';

const AppContext = createContext<AppDataContextType | undefined>(undefined);

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

      const storedEntriesEnc = await SecureStorage.getItem(STORAGE_ENTRIES_KEY);
      if (storedEntriesEnc) {
        const decryptedEntries = await decryptData<Entry[]>(storedEntriesEnc, masterKeyHex);
        setEntries(decryptedEntries || []);
      } else {
        setEntries([]);
      }
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
      const encryptedEntries = await encryptData(updatedEntries, C_MASTER_KEY_HEX);
      await SecureStorage.saveItem(STORAGE_ENTRIES_KEY, encryptedEntries);
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

      const existingEntriesEnc = await SecureStorage.getItem(STORAGE_ENTRIES_KEY);
      if (existingEntriesEnc) {
        try {
          const decrypted = await decryptData<Entry[]>(existingEntriesEnc, C_MASTER_KEY_HEX);
          setEntries(decrypted || []);
        } catch (decErr) {
           console.warn("Could not decrypt existing entries with new master password. Starting fresh or critical error.", decErr);
           setEntries([]);
           await SecureStorage.saveItem(STORAGE_ENTRIES_KEY, await encryptData([], C_MASTER_KEY_HEX!));
        }
      } else {
         setEntries([]);
         await SecureStorage.saveItem(STORAGE_ENTRIES_KEY, await encryptData([], C_MASTER_KEY_HEX!));
      }

      setIsEncryptionKeySet(true);
      // isAppLocked will be set to false by loadInitialDataAfterUnlock on success
      await loadInitialDataAfterUnlock(C_MASTER_KEY_HEX!);
      return !isAppLocked; // Return true if successfully unlocked
    } catch (error) {
      console.error("Error setting master password:", error);
      C_MASTER_KEY_HEX = null;
      setIsAppLocked(true);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [loadInitialDataAfterUnlock, isAppLocked]);

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
        const storedEncryptedMasterKey = await SecureStorage.getItem(STORAGE_ENCRYPTION_KEY_ALIAS, {
          // No specific keychainService needed here for getItem usually, options are for saving.
          // If saved with specific options, they might need to be compatible.
          // `requireAuthentication: true` is not an option for `getItemAsync`.
          // It's an option for `setItemAsync` to link the item to biometric/passcode presence.
        });
        if (storedEncryptedMasterKey) {
            C_MASTER_KEY_HEX = storedEncryptedMasterKey;
            await loadInitialDataAfterUnlock(C_MASTER_KEY_HEX);
            success = !isAppLocked; 
        } else {
             console.warn("Biometrics success, but no master key found in SecureStore. Fallback to password.");
             setIsBiometricsEnabled(false); 
             await SecureStorage.deleteItem(STORAGE_BIOMETRICS_ENABLED_KEY);
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
  }, [isBiometricsSupported, isBiometricsEnabled, loadInitialDataAfterUnlock, isAppLocked]);


  const addEntry = useCallback(async (entryData: EntryFormData, type: EntryType): Promise<boolean> => {
    if (!C_MASTER_KEY_HEX) return false;
    if (plan === UserPlan.Free && entries.length >= FREE_PLAN_LIMIT) {
        console.warn("Free plan limit reached. Cannot add more entries.");
        return false;
    }
    const newEntry: Entry = {
      id: crypto.randomUUID(),
      type,
      ...entryData,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    } as Entry; 

    const updatedEntries = [...entries, newEntry];
    setEntries(updatedEntries);
    await persistEntries(updatedEntries);
    return true;
  }, [entries, plan, persistEntries]);

  const updateEntry = useCallback(async (id: string, entryData: Partial<EntryFormData>): Promise<boolean> => {
    if (!C_MASTER_KEY_HEX) return false;
    const updatedEntries = entries.map(entry =>
      entry.id === id ? { ...entry, ...entryData, updatedAt: Date.now() } : entry
    );
    setEntries(updatedEntries);
    await persistEntries(updatedEntries);
    return true;
  }, [entries, persistEntries]);

  const deleteEntry = useCallback(async (id: string): Promise<void> => {
    if (!C_MASTER_KEY_HEX) return;
    const updatedEntries = entries.filter(entry => entry.id !== id);
    setEntries(updatedEntries);
    await persistEntries(updatedEntries);
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
            
            // Fix: Use the imported KeychainAccessibility enum.
            await SecureStorage.saveItem(STORAGE_ENCRYPTION_KEY_ALIAS, C_MASTER_KEY_HEX, {
                requireAuthentication: Platform.OS === 'ios' ? true : undefined, // iOS specific to link to device passcode/biometrics
                keychainAccessible: KeychainAccessibility.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
            });
            await SecureStorage.saveItem(STORAGE_BIOMETRICS_ENABLED_KEY, 'true');
            setIsBiometricsEnabled(true);
            return true;
        } else { 
            await SecureStorage.deleteItem(STORAGE_ENCRYPTION_KEY_ALIAS);
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
  }, [isBiometricsSupported, C_MASTER_KEY_HEX]); 


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
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppDataProvider');
  }
  return context;
};