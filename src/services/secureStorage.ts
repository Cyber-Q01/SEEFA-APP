import * as SecureStore from 'expo-secure-store';

export async function saveItem(key: string, value: string, options?: SecureStore.SecureStoreOptions): Promise<void> {
  try {
    await SecureStore.setItemAsync(key, value, options);
  } catch (error) {
    console.error(`Error saving item to SecureStore (key: ${key}):`, error);
    throw error; // Re-throw to be handled by caller
  }
}

export async function getItem(key: string, options?: SecureStore.SecureStoreOptions): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(key, options);
  } catch (error) {
    console.error(`Error getting item from SecureStore (key: ${key}):`, error);
    return null; 
  }
}

export async function deleteItem(key: string, options?: SecureStore.SecureStoreOptions): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(key, options);
  } catch (error) {
    console.error(`Error deleting item from SecureStore (key: ${key}):`, error);
    // Optionally throw, or just log
  }
}

export async function isAvailable(): Promise<boolean> {
    return SecureStore.isAvailableAsync();
}