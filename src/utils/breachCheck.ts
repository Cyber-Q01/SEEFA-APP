import { sha1 } from 'js-sha1';

export async function checkPasswordBreach(password: string): Promise<number> {
  const hash = sha1(password).toUpperCase();
  const prefix = hash.slice(0, 5);
  const suffix = hash.slice(5);

  const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
  if (!response.ok) throw new Error('Failed to check breach status');

  const text = await response.text();
  const lines = text.split('\n');
  for (const line of lines) {
    const [hashSuffix, count] = line.trim().split(':');
    if (hashSuffix === suffix) {
      return parseInt(count, 10); // Number of times this password was found
    }
  }
  return 0; // Not found in breaches
}