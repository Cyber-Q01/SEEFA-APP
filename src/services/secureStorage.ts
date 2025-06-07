import * as SecureStore from 'expo-secure-store';

// Function to remove an item from secure storage
export async function removeItem(key: string): Promise<void> {
  await SecureStore.deleteItemAsync(key);
}

// Function to save an item to secure storage
export async function saveItem(key: string, value: string, options?: SecureStore.SecureStoreOptions): Promise<void> {
  try {
    await SecureStore.setItemAsync(key, value, options);
  } catch (error) {
   
    throw error; // Re-throw to be handled by caller
  }
}

// Function to get an item from secure storage
export async function getItem(key: string, options?: SecureStore.SecureStoreOptions): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(key, options);
  } catch (error) {

    return null; 
  }
}

// Function to delete an item from secure storage
export async function deleteItem(key: string, options?: SecureStore.SecureStoreOptions): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(key, options);
  } catch (error) {
   
    // Optionally throw, or just log
  }
}

// Function to check if secure storage is available
export async function isAvailable(): Promise<boolean> {
    return SecureStore.isAvailableAsync();
}
