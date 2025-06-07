import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import * as SecureStore from 'expo-secure-store';
import { STORAGE_ENTRIES_KEY } from '../config/constants'; // <-- FIXED

export async function backupVault(): Promise<string | null> {
  const encrypted = await SecureStore.getItemAsync(STORAGE_ENTRIES_KEY); // <-- FIXED
  if (!encrypted) return null;
  const fileUri = FileSystem.documentDirectory + 'seefa-vault-backup.txt';
  await FileSystem.writeAsStringAsync(fileUri, encrypted, { encoding: FileSystem.EncodingType.UTF8 });
  
  return fileUri;
}

export async function restoreVault(): Promise<boolean> {
  const result = await DocumentPicker.getDocumentAsync({ type: 'text/plain' });
  if (result.canceled || !result.assets?.[0]?.uri) return false;
  const fileUri = result.assets[0].uri;
  const encrypted = await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.UTF8 });
  if (!encrypted) return false;
  await SecureStore.setItemAsync(STORAGE_ENTRIES_KEY, encrypted); // <-- FIXED
  return true;
}