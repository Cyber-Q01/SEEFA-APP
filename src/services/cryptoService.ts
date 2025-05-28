import CryptoJS from 'crypto-js';
import * as SecureStore from '../services/secureStorage'; // Use our wrapper
import { STORAGE_MASTER_KEY_SALT_ALIAS } from '../config/constants';

const AES_KEY_SIZE_BYTES = 256 / 8; // 32 bytes for AES-256
const PBKDF2_ITERATIONS = 100000; // Increased iterations for better security
const SALT_LENGTH_BYTES = 16;
const IV_LENGTH_BYTES = 128 / 8; // 16 bytes for AES-CBC

/**
 * Generates a random salt as a WordArray.
 */
function generateRandomWordArray(lengthBytes: number): CryptoJS.lib.WordArray {
  return CryptoJS.lib.WordArray.random(lengthBytes);
}

/**
 * Derives an encryption key from a master password and salt using PBKDF2.
 * Stores the salt if newly generated.
 * Returns the key as a Hex string.
 */
export async function deriveKeyFromMasterPassword(masterPassword: string): Promise<{keyHex: string, saltHex: string}> {
  let saltHex = await SecureStore.getItem(STORAGE_MASTER_KEY_SALT_ALIAS);
  let saltWordArray: CryptoJS.lib.WordArray;

  if (saltHex) {
    saltWordArray = CryptoJS.enc.Hex.parse(saltHex);
  } else {
    saltWordArray = generateRandomWordArray(SALT_LENGTH_BYTES);
    saltHex = CryptoJS.enc.Hex.stringify(saltWordArray);
    await SecureStore.saveItem(STORAGE_MASTER_KEY_SALT_ALIAS, saltHex);
  }

  const key = CryptoJS.PBKDF2(masterPassword, saltWordArray, {
    keySize: AES_KEY_SIZE_BYTES / 4, // keySize is in 32-bit words
    iterations: PBKDF2_ITERATIONS,
    hasher: CryptoJS.algo.SHA256 
  });
  return { keyHex: CryptoJS.enc.Hex.stringify(key), saltHex };
}


/**
 * Encrypts data using AES-256-CBC.
 * Prepends a random IV to the ciphertext.
 * masterKeyHex: The AES key, derived from the master password, in Hex format.
 * Returns: Base64 encoded string of [IV + Ciphertext].
 */
export async function encryptData<T>(data: T, masterKeyHex: string): Promise<string> {
  if (data === null || data === undefined) {
    throw new Error("Cannot encrypt null or undefined data.");
  }
  if (!masterKeyHex) {
    throw new Error("Master key is not available for encryption.");
  }

  const key = CryptoJS.enc.Hex.parse(masterKeyHex);
  const iv = generateRandomWordArray(IV_LENGTH_BYTES);
  const dataString = JSON.stringify(data);

  const encrypted = CryptoJS.AES.encrypt(dataString, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  
  // Prepend IV to ciphertext: iv (hex) + ciphertext (hex)
  // Then convert the whole thing to base64 for storage.
  const ivHex = CryptoJS.enc.Hex.stringify(iv);
  const ciphertextHex = CryptoJS.enc.Hex.stringify(encrypted.ciphertext);
  
  return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Hex.parse(ivHex + ciphertextHex));
}

/**
 * Decrypts data encrypted with encryptData.
 * masterKeyHex: The AES key, derived from the master password, in Hex format.
 * encryptedBase64Data: Base64 encoded string of [IV + Ciphertext].
 */
export async function decryptData<T>(encryptedBase64Data: string, masterKeyHex: string): Promise<T> {
  if (!encryptedBase64Data) {
    throw new Error("Cannot decrypt empty data.");
  }
   if (!masterKeyHex) {
    throw new Error("Master key is not available for decryption.");
  }

  const key = CryptoJS.enc.Hex.parse(masterKeyHex);

  try {
    // Parse base64 data directly to WordArray (optimization - does not affect security)
    const encryptedWordArray = CryptoJS.enc.Base64.parse(encryptedBase64Data);

    // Extract IV and ciphertext as WordArray objects
    const iv = CryptoJS.lib.WordArray.create(encryptedWordArray.words.slice(0, IV_LENGTH_BYTES / 4));
    const ciphertext = CryptoJS.lib.WordArray.create(encryptedWordArray.words.slice(IV_LENGTH_BYTES / 4));

    const decrypted = CryptoJS.AES.decrypt({ ciphertext: ciphertext } as CryptoJS.lib.CipherParams, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
    if (!decryptedString) {
      console.error("Decryption resulted in empty string. Check key or data integrity.");
      throw new Error("Decryption failed: Invalid data or key.");
    }
    return JSON.parse(decryptedString) as T;
  } catch (error) {
    console.error('Decryption error:', error);
    if (error instanceof SyntaxError) {
      throw new Error("Decryption failed: Malformed data after decryption.");
    }
    throw new Error("Decryption failed. Data might be corrupted or key is incorrect.");
  }
}
