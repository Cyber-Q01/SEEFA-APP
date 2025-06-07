// cryptoService.ts
// SEEFA Password Manager Encryption Service
// Provides robust, production-grade cryptography for all sensitive data.
// Uses AES-256-CBC for encryption, PBKDF2 for key derivation, and secure random salts/IVs.
// All functions are fully documented for maintainability and auditability.

import CryptoJS from 'crypto-js';
import * as SecureStore from '../services/secureStorage'; // Secure storage wrapper for device keychain
import { STORAGE_MASTER_KEY_SALT_ALIAS } from '../config/constants';

// --- CONSTANTS ---
const AES_KEY_SIZE_BYTES = 256 / 8; // 32 bytes for AES-256
const PBKDF2_ITERATIONS = 100000; // High iteration count for PBKDF2 (security best practice)
const SALT_LENGTH_BYTES = 16; // 128-bit salt
const IV_LENGTH_BYTES = 128 / 8; // 16 bytes for AES-CBC IV

/**
 * Generates a cryptographically secure random WordArray of the given length (in bytes).
 * Used for salts and IVs.
 */
function generateRandomWordArray(lengthBytes: number): CryptoJS.lib.WordArray {
  return CryptoJS.lib.WordArray.random(lengthBytes);
}

/**
 * Derives an AES-256 encryption key from a master password using PBKDF2.
 * - If a salt is already stored, it is reused for deterministic key derivation.
 * - If not, a new salt is generated and securely stored.
 *
 * @param masterPassword The user's master password (never stored).
 * @returns { keyHex, saltHex } - The derived key and salt, both as hex strings.
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

  // Derive key using PBKDF2 (SHA-256, 100k iterations, 256-bit key)
  const key = CryptoJS.PBKDF2(masterPassword, saltWordArray, {
    keySize: AES_KEY_SIZE_BYTES / 4, // keySize is in 32-bit words
    iterations: PBKDF2_ITERATIONS,
    hasher: CryptoJS.algo.SHA256 
  });
  return { keyHex: CryptoJS.enc.Hex.stringify(key), saltHex };
}

/**
 * Encrypts any serializable data using AES-256-CBC.
 * - Prepends a random IV to the ciphertext for maximum security.
 * - Returns a base64 string: [IV + Ciphertext].
 *
 * @param data The data to encrypt (object, string, etc.)
 * @param masterKeyHex The AES key (hex string) derived from the master password.
 * @returns Base64-encoded string of [IV + Ciphertext].
 * @throws Error if data or key is missing.
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
 * Decrypts data previously encrypted with encryptData().
 * - Extracts IV and ciphertext from the base64 input.
 * - Decrypts using AES-256-CBC and the provided key.
 *
 * @param encryptedBase64Data Base64 string of [IV + Ciphertext].
 * @param masterKeyHex The AES key (hex string) derived from the master password.
 * @returns The decrypted data (original type T).
 * @throws Error if decryption fails or data is malformed.
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
    // Parse base64 data directly to WordArray
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
      throw new Error("Decryption failed: Invalid data or key.");
    }
    return JSON.parse(decryptedString) as T;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error("Decryption failed: Malformed data after decryption.");
    }
    throw new Error("Decryption failed. Data might be corrupted or key is incorrect.");
  }
}

// --- END OF FILE ---
// All cryptographic operations are performed client-side. No secrets are ever sent to the server.
// This file is fully commented for auditability and future maintenance.
