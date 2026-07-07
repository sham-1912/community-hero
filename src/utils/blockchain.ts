export interface Block {
  index: number;
  timestamp: string;
  data: {
    id: string;
    title: string;
    description: string;
    category: string;
    priority: string;
    location: {
      lat: number;
      lng: number;
      address: string;
    };
    status: 'Pending' | 'Investigating' | 'In Progress' | 'Resolved';
    reporterHash: string;
    mediaCID?: string;
  };
  previousHash: string;
  hash: string;
  nonce: number;
}

// A standard synchronous SHA-256 implementation in TypeScript
export function sha256(ascii: string): string {
  function rightRotate(value: number, amount: number) {
    return (value >>> amount) | (value << (32 - amount));
  }
  
  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  let i, j;

  const words: number[] = [];
  const asciiLength = ascii.length;
  
  // Hash values & round constants
  const hash = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
  ];

  const k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];

  let paddedAscii = ascii + '\x80';
  while ((paddedAscii.length % 64) !== 56) {
    paddedAscii += '\x00';
  }
  
  for (i = 0; i < paddedAscii.length; i++) {
    j = paddedAscii.charCodeAt(i);
    words[i >> 2] |= j << ((3 - i % 4) * 8);
  }
  
  words[words.length] = ((asciiLength * 8) / maxWord) | 0;
  words[words.length] = (asciiLength * 8) | 0;

  let H0 = hash[0], H1 = hash[1], H2 = hash[2], H3 = hash[3], H4 = hash[4], H5 = hash[5], H6 = hash[6], H7 = hash[7];

  for (i = 0; i < words.length; i += 16) {
    const w = words.slice(i, i + 16);
    const oldH0 = H0, oldH1 = H1, oldH2 = H2, oldH3 = H3, oldH4 = H4, oldH5 = H5, oldH6 = H6, oldH7 = H7;

    for (j = 0; j < 64; j++) {
      if (j >= 16) {
        const w15 = w[j - 15] || 0;
        const w2 = w[j - 2] || 0;
        const w16 = w[j - 16] || 0;
        const w7 = w[j - 7] || 0;
        const s0 = rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3);
        const s1 = rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10);
        w[j] = (w16 + s0 + w7 + s1) | 0;
      }

      const s1 = rightRotate(H4, 6) ^ rightRotate(H4, 11) ^ rightRotate(H4, 25);
      const ch = (H4 & H5) ^ (~H4 & H6);
      const temp1 = (H7 + s1 + ch + k[j] + (w[j] || 0)) | 0;
      const s0 = rightRotate(H0, 2) ^ rightRotate(H0, 13) ^ rightRotate(H0, 22);
      const maj = (H0 & H1) ^ (H0 & H2) ^ (H1 & H2);
      const temp2 = (s0 + maj) | 0;

      H7 = H6;
      H6 = H5;
      H5 = H4;
      H4 = (H3 + temp1) | 0;
      H3 = H2;
      H2 = H1;
      H1 = H0;
      H0 = (temp1 + temp2) | 0;
    }

    H0 = (H0 + oldH0) | 0;
    H1 = (H1 + oldH1) | 0;
    H2 = (H2 + oldH2) | 0;
    H3 = (H3 + oldH3) | 0;
    H4 = (H4 + oldH4) | 0;
    H5 = (H5 + oldH5) | 0;
    H6 = (H6 + oldH6) | 0;
    H7 = (H7 + oldH7) | 0;
  }

  const hex = (num: number) => {
    const s = (num >>> 0).toString(16);
    return ('00000000' + s).slice(-8);
  };
  return hex(H0) + hex(H1) + hex(H2) + hex(H3) + hex(H4) + hex(H5) + hex(H6) + hex(H7);
}

export function calculateBlockHash(block: Omit<Block, 'hash'>): string {
  const dataStr = JSON.stringify(block.data);
  const payload = `${block.index}${block.timestamp}${dataStr}${block.previousHash}${block.nonce}`;
  return sha256(payload);
}

export function createBlock(index: number, timestamp: string, data: Block['data'], previousHash: string): Block {
  const nonce = 0;
  const blockObj: Omit<Block, 'hash'> = {
    index,
    timestamp,
    data,
    previousHash,
    nonce,
  };
  return {
    ...blockObj,
    hash: calculateBlockHash(blockObj),
  };
}

export interface ValidationResult {
  isValid: boolean;
  errorType?: 'HASH_MISMATCH' | 'PREVIOUS_HASH_MISMATCH' | 'GENESIS_TAMPERED';
  errorIndex?: number;
  expectedHash?: string;
  actualHash?: string;
}

export function validateChain(chain: Block[]): ValidationResult {
  if (chain.length === 0) return { isValid: true };

  for (let i = 0; i < chain.length; i++) {
    const block = chain[i];
    const { hash, ...blockWithoutHash } = block;
    const computedHash = calculateBlockHash(blockWithoutHash);

    if (block.hash !== computedHash) {
      return {
        isValid: false,
        errorType: 'HASH_MISMATCH',
        errorIndex: i,
        expectedHash: computedHash,
        actualHash: block.hash,
      };
    }

    if (i > 0) {
      const prevBlock = chain[i - 1];
      if (block.previousHash !== prevBlock.hash) {
        return {
          isValid: false,
          errorType: 'PREVIOUS_HASH_MISMATCH',
          errorIndex: i,
          expectedHash: prevBlock.hash,
          actualHash: block.previousHash,
        };
      }
    }
  }

  return { isValid: true };
}
