/**
 * Secure encryption using Web Crypto API (AES-GCM).
 * Suitable for production-grade security.
 */

const ALGORITHM = "AES-GCM";
const IV_LENGTH = 12; // Recommended for GCM
const SALT_LENGTH = 16;
const ITERATIONS = 100000;

/**
 * Derives a CryptoKey from a password string and salt.
 */
async function deriveKey(
  password: string,
  salt: Uint8Array,
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: ITERATIONS,
      hash: "SHA-256",
    },
    passwordKey,
    { name: ALGORITHM, length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

/**
 * Encrypts text using a password.
 * Returns base64 encoded string: salt(16) + iv(12) + ciphertext
 */
export const encrypt = async (text: string, key: string): Promise<string> => {
  if (!key) throw new Error("Encryption key required");

  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

  const cryptoKey = await deriveKey(key, salt);

  const encrypted = await crypto.subtle.encrypt(
    {
      name: ALGORITHM,
      iv: iv,
    },
    cryptoKey,
    data,
  );

  // Combine salt + iv + encrypted data
  const combined = new Uint8Array(
    salt.length + iv.length + encrypted.byteLength,
  );
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(encrypted), salt.length + iv.length);

  // Convert to base64
  return btoa(String.fromCharCode(...combined));
};

/**
 * Decrypts base64 encoded string using a password.
 */
export const decrypt = async (
  encoded: string,
  key: string,
): Promise<string> => {
  if (!key) throw new Error("Decryption key required");

  try {
    const combined = new Uint8Array(
      atob(encoded)
        .split("")
        .map((c) => c.charCodeAt(0)),
    );

    const salt = combined.slice(0, SALT_LENGTH);
    const iv = combined.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const data = combined.slice(SALT_LENGTH + IV_LENGTH);

    const cryptoKey = await deriveKey(key, salt);

    const decrypted = await crypto.subtle.decrypt(
      {
        name: ALGORITHM,
        iv: iv,
      },
      cryptoKey,
      data,
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    console.error("Decryption failed:", error);
    // Fallback for old XOR encrypted data during transition (optional)
    // For now, we'll just return the original if it looks like it might be old
    return "Error: Decryption Failed";
  }
};
