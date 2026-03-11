const PBKDF2_ITERATIONS = 150000;
const PBKDF2_KEY_LENGTH_BITS = 256;

function getCrypto(): Crypto {
  if (typeof crypto !== "undefined") {
    return crypto as Crypto;
  }
  // Fallback for Node.js environments where global crypto is under globalThis
  const globalCrypto = (globalThis as any).crypto;
  if (!globalCrypto) {
    throw new Error("crypto.subtle is not available in this environment");
  }
  return globalCrypto as Crypto;
}

function toBase64(buffer: ArrayBuffer): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(buffer).toString("base64");
  }
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function fromBase64(str: string): ArrayBuffer {
  if (typeof Buffer !== "undefined") {
    const buf = Buffer.from(str, "base64");
    return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
  }
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

async function deriveKey(
  password: string,
  salt: ArrayBuffer,
  iterations: number
): Promise<ArrayBuffer> {
  const enc = new TextEncoder();
  const cryptoInstance = getCrypto();

  const keyMaterial = await cryptoInstance.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );

  return cryptoInstance.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations,
      hash: "SHA-256",
    },
    keyMaterial,
    PBKDF2_KEY_LENGTH_BITS
  );
}

export async function hashPassword(password: string): Promise<string> {
  const cryptoInstance = getCrypto();
  const saltBytes = new Uint8Array(16);
  cryptoInstance.getRandomValues(saltBytes);

  const derived = await deriveKey(password, saltBytes.buffer, PBKDF2_ITERATIONS);
  const saltB64 = toBase64(saltBytes.buffer);
  const hashB64 = toBase64(derived);

  // Format: pbkdf2$iterations$salt$hash
  return `pbkdf2$${PBKDF2_ITERATIONS}$${saltB64}$${hashB64}`;
}

export async function verifyPassword(
  password: string,
  stored: string
): Promise<boolean> {
  try {
    const parts = stored.split("$");
    if (parts.length !== 4 || parts[0] !== "pbkdf2") return false;

    const iterations = parseInt(parts[1], 10);
    if (!Number.isFinite(iterations) || iterations <= 0) return false;

    const salt = fromBase64(parts[2]);
    const expectedHash = fromBase64(parts[3]);

    const derived = await deriveKey(password, salt, iterations);

    const a = new Uint8Array(derived);
    const b = new Uint8Array(expectedHash);
    if (a.length !== b.length) return false;

    // Constant-time comparison
    let diff = 0;
    for (let i = 0; i < a.length; i++) {
      diff |= a[i] ^ b[i];
    }
    return diff === 0;
  } catch {
    return false;
  }
}

