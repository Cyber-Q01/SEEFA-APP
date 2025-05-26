

export const FREE_PLAN_LIMIT = 5;

// expo-secure-store keys
export const STORAGE_ENTRIES_KEY = 'seefa_entries_encrypted_v2'; // Incremented version due to potential structure changes
export const STORAGE_PLAN_KEY = 'seefa_plan_v1';
export const STORAGE_ENCRYPTION_KEY_ALIAS = 'seefa_aes_key_bio_v1'; // Key for storing AES key for biometrics
export const STORAGE_MASTER_KEY_SALT_ALIAS = 'seefa_master_key_salt_v1';
export const STORAGE_BIOMETRICS_ENABLED_KEY = 'seefa_biometrics_enabled_v1';


// Paystack
// This is a TEST key. For LIVE transactions, replace with your Paystack LIVE Public Key.
export const PAYSTACK_PUBLIC_KEY = 'pk_test_87aff6c51dc922cb2cd43382d29de1c91531242c';
export const PAYMENT_AMOUNT_KOBO = 480000; // ₦4800 in kobo (4800 * 100)
export const PAYMENT_CURRENCY = 'NGN';

export const APP_NAME = "SEEFA";