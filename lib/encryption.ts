// Client-side encryption utilities for 100% private video vault
// All encryption happens in the browser - server never sees plaintext

const ALGORITHM = "AES-GCM";
const KEY_LENGTH = 256;
const ITERATIONS = 100000;

/**
 * Derive encryption key from password using PBKDF2
 */
export async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordData = encoder.encode(password);

  const baseKey = await crypto.subtle.importKey(
    "raw",
    passwordData,
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt.buffer as ArrayBuffer,
      iterations: ITERATIONS,
      hash: "SHA-256",
    },
    baseKey,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Generate a random salt for key derivation
 */
export function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(16));
}

/**
 * Generate a random IV for encryption
 */
export function generateIV(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(12));
}

/**
 * Encrypt data with AES-GCM
 */
export async function encryptData(
  data: ArrayBuffer,
  key: CryptoKey,
  iv: Uint8Array
): Promise<ArrayBuffer> {
  return crypto.subtle.encrypt(
    { name: ALGORITHM, iv: iv.buffer as ArrayBuffer },
    key,
    data
  );
}

/**
 * Decrypt data with AES-GCM
 */
export async function decryptData(
  encryptedData: ArrayBuffer,
  key: CryptoKey,
  iv: Uint8Array
): Promise<ArrayBuffer> {
  return crypto.subtle.decrypt(
    { name: ALGORITHM, iv: iv.buffer as ArrayBuffer },
    key,
    encryptedData
  );
}

/**
 * Encrypt a file using password
 * Returns encrypted blob with salt and IV prepended
 */
export async function encryptFile(
  file: File | Blob,
  password: string
): Promise<{ encryptedBlob: Blob; salt: string; iv: string }> {
  const salt = generateSalt();
  const iv = generateIV();
  console.log("Encrypting - salt:", arrayBufferToBase64(salt), "iv:", arrayBufferToBase64(iv), "salt len:", salt.length, "iv len:", iv.length);
  
  const key = await deriveKey(password, salt);

  const fileData = await file.arrayBuffer();
  console.log("Original file size:", fileData.byteLength);
  
  const encryptedData = await encryptData(fileData, key, iv);
  console.log("Encrypted data size:", encryptedData.byteLength);

  // Combine: salt (16 bytes) + iv (12 bytes) + encrypted data
  const combined = new Uint8Array(salt.length + iv.length + encryptedData.byteLength);
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(encryptedData), salt.length + iv.length);

  return {
    encryptedBlob: new Blob([combined]),
    salt: arrayBufferToBase64(salt),
    iv: arrayBufferToBase64(iv),
  };
}

/**
 * Decrypt a file using password
 * Expects format: salt (16 bytes) + iv (12 bytes) + encrypted data
 */
export async function decryptFile(
  encryptedBlob: Blob,
  password: string,
  saltBase64: string,
  ivBase64: string
): Promise<ArrayBuffer> {
  console.log("Decrypting - salt:", saltBase64, "iv:", ivBase64, "blob size:", encryptedBlob.size);
  
  const salt = new Uint8Array(base64ToArrayBuffer(saltBase64));
  const iv = new Uint8Array(base64ToArrayBuffer(ivBase64));
  console.log("Decoded salt length:", salt.length, "iv length:", iv.length);
  
  const key = await deriveKey(password, salt);
  
  const encryptedData = await encryptedBlob.arrayBuffer();
  console.log("Encrypted data size:", encryptedData.byteLength);
  
  // Check first few bytes to verify data integrity
  const firstBytes = new Uint8Array(encryptedData.slice(0, 16));
  console.log("First 16 bytes of encrypted data:", Array.from(firstBytes).map(b => b.toString(16).padStart(2, '0')).join(' '));
  
  return decryptData(encryptedData, key, iv);
}

/**
 * Encrypt a small chunk (for streaming)
 */
export async function encryptChunk(
  chunk: ArrayBuffer,
  password: string,
  salt: Uint8Array,
  iv: Uint8Array
): Promise<ArrayBuffer> {
  const key = await deriveKey(password, salt);
  return encryptData(chunk, key, iv);
}

/**
 * Decrypt a small chunk (for streaming)
 */
export async function decryptChunk(
  encryptedChunk: ArrayBuffer,
  password: string,
  saltBase64: string,
  ivBase64: string
): Promise<ArrayBuffer> {
  const salt = new Uint8Array(base64ToArrayBuffer(saltBase64));
  const iv = new Uint8Array(base64ToArrayBuffer(ivBase64));
  const key = await deriveKey(password, salt);
  return decryptData(encryptedChunk, key, iv);
}

/**
 * Generate a secure random password
 */
export function generateSecurePassword(length: number = 32): string {
  const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  const randomValues = crypto.getRandomValues(new Uint8Array(length));
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset[randomValues[i] % charset.length];
  }
  return password;
}

/**
 * Convert ArrayBuffer to Base64 string
 */
export function arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Convert Base64 string to ArrayBuffer
 */
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Hash a string using SHA-256 (for verification codes, not encryption)
 */
export async function hashString(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return arrayBufferToBase64(hashBuffer);
}

/**
 * Create an encrypted thumbnail from a video file
 * Returns encrypted thumbnail blob
 */
export async function createEncryptedThumbnail(
  videoFile: File,
  password: string,
  maxWidth: number = 320,
  maxHeight: number = 180
): Promise<{ encryptedBlob: Blob; salt: string; iv: string } | null> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      resolve(null);
      return;
    }

    video.preload = "metadata";
    video.crossOrigin = "anonymous";
    video.src = URL.createObjectURL(videoFile);

    video.onloadeddata = async () => {
      // Calculate dimensions while maintaining aspect ratio
      let width = video.videoWidth;
      let height = video.videoHeight;
      const aspectRatio = width / height;

      if (width > maxWidth) {
        width = maxWidth;
        height = width / aspectRatio;
      }
      if (height > maxHeight) {
        height = maxHeight;
        width = height * aspectRatio;
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(video, 0, 0, width, height);

      // Get thumbnail as blob
      const blob = await new Promise<Blob | null>((r) =>
        canvas.toBlob((b) => r(b), "image/jpeg", 0.8)
      );

      URL.revokeObjectURL(video.src);

      if (blob) {
        const encrypted = await encryptFile(blob, password);
        resolve(encrypted);
      } else {
        resolve(null);
      }
    };

    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      resolve(null);
    };

    // Timeout fallback
    setTimeout(() => {
      URL.revokeObjectURL(video.src);
      resolve(null);
    }, 5000);
  });
}
