declare module 'expo-keystore' {
  export function getItem(key: string): Promise<string | null>;
  export function setItem(key: string, value: string): Promise<void>;
  export function deleteItem(key: string): Promise<void>;
}
