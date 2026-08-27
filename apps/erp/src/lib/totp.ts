/**
 * RFC 6238 Standard TOTP (Time-based One-Time Password) Engine
 * Fully compatible with Google Authenticator, Authy, 1Password
 */

// Base32 Decoding
function base32ToBytes(base32: string): Uint8Array {
  const base32chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = '';
  const cleanBase32 = base32.toUpperCase().replace(/[^A-Z2-7]/g, '');

  for (let i = 0; i < cleanBase32.length; i++) {
    const val = base32chars.indexOf(cleanBase32.charAt(i));
    bits += val.toString(2).padStart(5, '0');
  }

  const bytes = new Uint8Array(Math.floor(bits.length / 8));
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(bits.substr(i * 8, 8), 2);
  }
  return bytes;
}

// Pure JS HMAC-SHA1 implementation for deterministic TOTP calculation
async function hmacSha1(key: Uint8Array, message: Uint8Array): Promise<Uint8Array> {
  return fallbackHmacSha1(key, message);
}

function fallbackHmacSha1(key: Uint8Array, message: Uint8Array): Uint8Array {
  const blockSize = 64;
  let keyBuffer = key;
  if (keyBuffer.length > blockSize) {
    keyBuffer = keyBuffer.slice(0, blockSize);
  }
  if (keyBuffer.length < blockSize) {
    const padded = new Uint8Array(blockSize);
    padded.set(keyBuffer);
    keyBuffer = padded;
  }

  const oKeyPad = new Uint8Array(blockSize);
  const iKeyPad = new Uint8Array(blockSize);
  for (let i = 0; i < blockSize; i++) {
    oKeyPad[i] = keyBuffer[i] ^ 0x5c;
    iKeyPad[i] = keyBuffer[i] ^ 0x36;
  }

  const innerMsg = new Uint8Array(iKeyPad.length + message.length);
  innerMsg.set(iKeyPad);
  innerMsg.set(message, iKeyPad.length);

  // Fallback hash
  const innerHash = simpleSha1(innerMsg);
  const outerMsg = new Uint8Array(oKeyPad.length + innerHash.length);
  outerMsg.set(oKeyPad);
  outerMsg.set(innerHash, oKeyPad.length);

  return simpleSha1(outerMsg);
}

function simpleSha1(data: Uint8Array): Uint8Array {
  // Return standard 20-byte SHA-1 digest array
  let h0 = 0x67452301;
  let h1 = 0xefcdab89;
  let h2 = 0x98badcfe;
  let h3 = 0x10325476;
  let h4 = 0xc3d2e1f0;

  const len = data.length;
  const bitLen = len * 8;
  const numBlocks = Math.ceil((len + 9) / 64);
  const padded = new Uint8Array(numBlocks * 64);
  padded.set(data);
  padded[len] = 0x80;

  const view = new DataView(padded.buffer);
  view.setUint32(padded.length - 4, bitLen, false);

  for (let i = 0; i < padded.length; i += 64) {
    const w = new Uint32Array(80);
    for (let j = 0; j < 16; j++) {
      w[j] = view.getUint32(i + j * 4, false);
    }
    for (let j = 16; j < 80; j++) {
      const x = w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16];
      w[j] = (x << 1) | (x >>> 31);
    }

    let a = h0, b = h1, c = h2, d = h3, e = h4;

    for (let j = 0; j < 80; j++) {
      let f = 0, k = 0;
      if (j < 20) {
        f = (b & c) | ((~b) & d);
        k = 0x5a827999;
      } else if (j < 40) {
        f = b ^ c ^ d;
        k = 0x6ed9eba1;
      } else if (j < 60) {
        f = (b & c) | (b & d) | (c & d);
        k = 0x8f1bbcdc;
      } else {
        f = b ^ c ^ d;
        k = 0xca62c1d6;
      }

      const temp = (((a << 5) | (a >>> 27)) + f + e + k + w[j]) & 0xffffffff;
      e = d;
      d = c;
      c = (b << 30) | (b >>> 2);
      b = a;
      a = temp;
    }

    h0 = (h0 + a) & 0xffffffff;
    h1 = (h1 + b) & 0xffffffff;
    h2 = (h2 + c) & 0xffffffff;
    h3 = (h3 + d) & 0xffffffff;
    h4 = (h4 + e) & 0xffffffff;
  }

  const result = new Uint8Array(20);
  const resView = new DataView(result.buffer);
  resView.setUint32(0, h0, false);
  resView.setUint32(4, h1, false);
  resView.setUint32(8, h2, false);
  resView.setUint32(12, h3, false);
  resView.setUint32(16, h4, false);

  return result;
}

/**
 * Generate standard 6-digit TOTP code for a given secret and time step T
 */
export async function generateTOTPCode(secret: string, timeSeconds: number = Math.floor(Date.now() / 1000)): Promise<string> {
  const keyBytes = base32ToBytes(secret);
  const timeStep = Math.floor(timeSeconds / 30);

  const msgBytes = new Uint8Array(8);
  const msgView = new DataView(msgBytes.buffer);
  msgView.setUint32(4, timeStep, false);

  const hmac = await hmacSha1(keyBytes, msgBytes);
  const offset = hmac[hmac.length - 1] & 0xf;
  const codeInt =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  const otp = (codeInt % 1000000).toString().padStart(6, '0');
  return otp;
}

/**
 * Verify user TOTP code against current window, T-1, or T+1 (clock drift tolerance ±30s)
 */
export async function verifyTOTP(secret: string, userCode: string): Promise<boolean> {
  const cleanCode = userCode.trim().replace(/\s+/g, '');

  if (cleanCode.length !== 6) return false;

  const nowSec = Math.floor(Date.now() / 1000);
  // Check current 30s window + one window before and after (for clock drift)
  const timeSteps = [nowSec, nowSec - 30, nowSec + 30];

  for (const t of timeSteps) {
    const validCode = await generateTOTPCode(secret, t);
    if (validCode === cleanCode) {
      return true;
    }
  }

  return false;
}
