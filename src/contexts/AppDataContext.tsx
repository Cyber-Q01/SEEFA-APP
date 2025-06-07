require('react-native-get-random-values');
import { v4 as uuidv4 } from 'uuid';
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
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

const AppContext = createContext<AppDataContextType | undefined>(undefined);

const STORAGE_ENTRY_IDS_KEY = 'entry_ids';
const VERIFIER_KEY = 'master_password_verifier';

let C_MASTER_KEY_HEX: string | null = null;

export const AppDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [plan, setPlan] = useState<UserPlan>(UserPlan.Free);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isEncryptionKeySet, setIsEncryptionKeySet] = useState<boolean>(false);
  const [isAppLocked, setIsAppLocked] = useState<boolean>(false);
  const [isBiometricsSupported, setIsBiometricsSupported] = useState<boolean>(false);
  const [isBiometricsEnabled, setIsBiometricsEnabled] = useState<boolean>(false);

  // --- Always use latest key in hooks ---
  const masterKeyRef = useRef<string | null>(null);

  // --- Load entries after unlock ---
  const loadInitialDataAfterUnlock = useCallback(async (masterKeyHex: string) => {
    setIsLoading(true);
    try {
      const encryptedEntries = await SecureStore.getItemAsync(STORAGE_ENTRIES_KEY);
      let loadedEntries: Entry[] = [];
      if (encryptedEntries) {
        const decrypted = await decryptData(encryptedEntries, masterKeyHex);
       
        // Only parse if decrypted === 'string'
        if (typeof decrypted === 'string' && decrypted.trim().length > 0) {
          loadedEntries = JSON.parse(decrypted);
        } else if (Array.isArray(decrypted)) {
          loadedEntries = decrypted;
        }
      }
      setEntries(loadedEntries);
     
      setIsAppLocked(false);
     
    } catch (error) {
   
      setEntries([]);

      setPlan(UserPlan.Free);
      setIsAppLocked(true);
      C_MASTER_KEY_HEX = null;
      masterKeyRef.current = null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkInitialState = useCallback(async () => {
    setIsLoading(true);
    const salt = await SecureStorage.getItem(STORAGE_MASTER_KEY_SALT_ALIAS);
    setIsEncryptionKeySet(!!salt);
    setIsAppLocked(!!salt);

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

  // --- Persist entries with latest key ---
  const persistEntries = useCallback(async (updatedEntries: Entry[]) => {
    const key = C_MASTER_KEY_HEX || masterKeyRef.current;
    if (!key) {
    
      return;
    }
    try {
      const encryptedEntries = await encryptData(updatedEntries, key);
      await SecureStore.setItemAsync(STORAGE_ENTRIES_KEY, encryptedEntries);
      const entryIds = updatedEntries.map(entry => entry.id);
      await SecureStorage.saveItem(STORAGE_ENTRY_IDS_KEY, JSON.stringify(entryIds));
    } catch (error) {
     
    }
  }, []);

  const persistPlan = useCallback(async (updatedPlan: UserPlan) => {
    try {
      await SecureStorage.saveItem(STORAGE_PLAN_KEY, updatedPlan);
    } catch (error) {
   
    }
  }, []);

  const setMasterPasswordAndInitialize = useCallback(async (password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { keyHex: derivedKeyHex, saltHex } = await deriveKeyFromMasterPassword(password);
      if (!derivedKeyHex || !saltHex) throw new Error("Key derivation failed.");
      C_MASTER_KEY_HEX = derivedKeyHex;
      masterKeyRef.current = derivedKeyHex;

      const encryptedVerifier = await encryptData("SEEFA_VERIFIER", derivedKeyHex);
      await SecureStorage.saveItem(VERIFIER_KEY, encryptedVerifier);

      const encryptedEntries = await encryptData([], derivedKeyHex);
      await SecureStore.setItemAsync(STORAGE_ENTRIES_KEY, encryptedEntries);

      setEntries([]);
      setIsEncryptionKeySet(true);
      setIsAppLocked(false);
      return true;
    } catch (error) {
    
      C_MASTER_KEY_HEX = null;
      masterKeyRef.current = null;
      setIsAppLocked(true);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

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
          masterKeyRef.current = storedEncryptedMasterKey;
          await loadInitialDataAfterUnlock(storedEncryptedMasterKey);
          success = true;
        } else {
         
          setIsBiometricsEnabled(false);
          await SecureStore.deleteItemAsync(STORAGE_BIOMETRICS_ENABLED_KEY);
        }
      }
    } catch (error) {

    } finally {
      setIsLoading(false);
    }
    return success;
  }, [isBiometricsSupported, isBiometricsEnabled, loadInitialDataAfterUnlock]);

  const addEntry = useCallback(async (entryData: EntryFormData, type: EntryType): Promise<boolean> => {
    const key = C_MASTER_KEY_HEX || masterKeyRef.current;
    if (!key) return false;
    if (plan === UserPlan.Free && entries.length >= FREE_PLAN_LIMIT) {
      
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
      await persistEntries(updatedEntries);
      return true;
    } catch (error) {
   
      return false;
    }
  }, [entries, plan, persistEntries]);

  const updateEntry = useCallback(async (id: string, entryData: Partial<EntryFormData>): Promise<boolean> => {
    const key = C_MASTER_KEY_HEX || masterKeyRef.current;
    if (!key) return false;
    const updatedEntries = entries.map(entry =>
      entry.id === id ? { ...entry, ...entryData, updatedAt: Date.now() } : entry
    );
    setEntries(updatedEntries);

    try {
      await persistEntries(updatedEntries);
      return true;
    } catch (error) {
   
      return false;
    }
  }, [entries, persistEntries]);

  const deleteEntry = useCallback(async (id: string): Promise<void> => {
    const key = C_MASTER_KEY_HEX || masterKeyRef.current;
    if (!key) return;
    const updatedEntries = entries.filter(entry => entry.id !== id);
    setEntries(updatedEntries);
   
    try {
      await persistEntries(updatedEntries);
    } catch (error) {
    
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
    if (!isEncryptionKeySet) return;
    C_MASTER_KEY_HEX = null;
    masterKeyRef.current = null;
    setIsAppLocked(true);
  }, [isEncryptionKeySet]);

  const unlockApp = useCallback(async (password?: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const salt = await SecureStorage.getItem(STORAGE_MASTER_KEY_SALT_ALIAS);
      if (!salt || !password) {
        setIsAppLocked(true);
        return false;
      }
      const { keyHex: enteredKeyHex } = await deriveKeyFromMasterPassword(password);

      const encryptedVerifier = await SecureStorage.getItem(VERIFIER_KEY);
      if (!encryptedVerifier) {
        setIsAppLocked(true);
        return false;
      }
      const verifier = await decryptData(encryptedVerifier, enteredKeyHex);
      if (verifier !== "SEEFA_VERIFIER") {
        setIsAppLocked(true);
        return false;
      }

      C_MASTER_KEY_HEX = enteredKeyHex;
      masterKeyRef.current = enteredKeyHex;
      await loadInitialDataAfterUnlock(enteredKeyHex);

      setIsAppLocked(false);
      setIsEncryptionKeySet(true);
    
      return true;
    } catch (error) {
      C_MASTER_KEY_HEX = null;
      masterKeyRef.current = null;
      setIsAppLocked(true);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [loadInitialDataAfterUnlock]);

  const toggleBiometrics = useCallback(async (enable: boolean, masterPassword?: string): Promise<boolean> => {
    if (!isBiometricsSupported) return false;
    setIsLoading(true);
    try {
      if (enable) {
        if (!masterPassword) {
       
          return false;
        }
        const { keyHex: currentMasterKeyHex } = await deriveKeyFromMasterPassword(masterPassword);
        if (!C_MASTER_KEY_HEX) {
          C_MASTER_KEY_HEX = currentMasterKeyHex;
          masterKeyRef.current = currentMasterKeyHex;
        } else if (C_MASTER_KEY_HEX !== currentMasterKeyHex) {
          
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
      if (!C_MASTER_KEY_HEX && !masterKeyRef.current) {
    
        return false;
      }
      const { keyHex: currentKeyHex } = await deriveKeyFromMasterPassword(currentPassword);
      if ((C_MASTER_KEY_HEX || masterKeyRef.current) !== currentKeyHex) {
        Alert.alert("Error", "Incorrect current master password.");
        return false;
      }
      const { keyHex: newKeyHex, saltHex } = await deriveKeyFromMasterPassword(newPassword);
      if (!newKeyHex || !saltHex) {

        return false;
      }
      const encryptedEntries = await encryptData(entries, newKeyHex);
      await SecureStore.setItemAsync(STORAGE_ENTRIES_KEY, encryptedEntries);
      C_MASTER_KEY_HEX = newKeyHex;
      masterKeyRef.current = newKeyHex;
      await SecureStore.setItemAsync(STORAGE_ENCRYPTION_KEY_ALIAS, C_MASTER_KEY_HEX);
      Alert.alert("Success", "Master password changed successfully.");
      return true;
    } catch (error) {
     
      Alert.alert("Error", "Failed to change master password. Please try again.");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [entries]);

  const isPro = plan === UserPlan.Pro;

  const contextValue: AppDataContextType = {
    entries,
    addEntry,
    updateEntry,
    deleteEntry,
    getEntryById,
    plan,
    isPro,
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
