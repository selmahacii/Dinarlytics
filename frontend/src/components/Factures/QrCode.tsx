import React from 'react';

type Props = {
  value: string;
  size?: number; // approximate total rendered size in px
  className?: string;
  title?: string;
  fgColor?: string;
  bgColor?: string;
  quietZoneModules?: number; // padding modules around symbol (default 4)
};

// Minimal QR Code generator (Version 2, ECC L) without deps.
// Auto mode:
// - If value matches Alphanumeric charset, use Alphanumeric mode (0010)
// - Otherwise fallback to Byte mode (0100) with 8-bit bytes (ISO-8859-1)
// Fixed parameters: Version 2 (25x25), ECC Level L (10 EC codewords), mask 0.

const ALPHANUM = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:';

function encodeAlphanumericBits(text: string): number[] {
  // Sanitize to allowed charset
  const filtered = text.split('').map(ch => (ALPHANUM.includes(ch) ? ch : ' ')).join('');
  const bits: number[] = [];
  // Mode indicator for Alphanumeric: 0010
  pushBits(bits, 0b0010, 4);
  // Character count indicator for version 2 (alphanumeric): 9 bits
  pushBits(bits, filtered.length, 9);
  // Encode in 11-bit groups (pairs) and 6-bit single
  let i = 0;
  while (i + 1 < filtered.length) {
    const v = ALPHANUM.indexOf(filtered[i]) * 45 + ALPHANUM.indexOf(filtered[i + 1]);
    pushBits(bits, v, 11);
    i += 2;
  }
  if (i < filtered.length) {
    pushBits(bits, ALPHANUM.indexOf(filtered[i]), 6);
  }
  return bits;
}

function encodeByteBits(text: string): number[] {
  const bits: number[] = [];
  // Mode indicator for Byte: 0100
  pushBits(bits, 0b0100, 4);
  // Character count indicator (version 1-9): 8 bits
  const bytes = Array.from(text).map(ch => ch.charCodeAt(0) & 0xFF);
  pushBits(bits, bytes.length, 8);
  // 8-bit bytes
  for (const b of bytes) pushBits(bits, b, 8);
  return bits;
}

function pushBits(bits: number[], value: number, length: number) {
  for (let i = length - 1; i >= 0; i--) {
    bits.push((value >>> i) & 1);
  }
}

// Reed-Solomon over GF(256) with generator poly for degree 10 (ECC Level L for Version 2)
const GF256 = {
  exp: [] as number[],
  log: [] as number[],
  init() {
    if (this.exp.length) return;
    this.exp = new Array(512).fill(0);
    this.log = new Array(256).fill(0);
    let x = 1;
    for (let i = 0; i < 255; i++) {
      this.exp[i] = x;
      this.log[x] = i;
      x <<= 1;
      if (x & 0x100) x ^= 0x11d; // primitive poly
    }
    for (let i = 255; i < 512; i++) this.exp[i] = this.exp[i - 255];
  },
  mul(a: number, b: number) {
    if (a === 0 || b === 0) return 0;
    return this.exp[this.log[a] + this.log[b]];
  },
  div(a: number, b: number) {
    if (a === 0) return 0;
    if (b === 0) throw new Error('GF division by zero');
    return this.exp[(this.log[a] + 255 - this.log[b]) % 255];
  }
};

function rsGeneratorPoly(degree: number): number[] {
  GF256.init();
  let poly = [1];
  for (let i = 0; i < degree; i++) {
    const term = [1, GF256.exp[i]]; // (x - a^i)
    poly = polyMul(poly, term);
  }
  return poly;
}

function polyMul(a: number[], b: number[]): number[] {
  const res = new Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      res[i + j] ^= GF256.mul(a[i], b[j]);
    }
  }
  return res;
}

function rsComputeECC(data: number[], ecLen: number): number[] {
  const gen = rsGeneratorPoly(ecLen);
  const msg = data.concat(new Array(ecLen).fill(0));
  for (let i = 0; i < data.length; i++) {
    const coef = msg[i];
    if (coef === 0) continue;
    for (let j = 0; j < gen.length; j++) {
      msg[i + j] ^= GF256.mul(coef, gen[j]);
    }
  }
  return msg.slice(msg.length - ecLen);
}

function makeMatrix(bits: number[], size: number): number[][] {
  // -1: unset, 0: white, 1: black, 2: reserved (function)
  const m = Array.from({ length: size }, () => new Array(size).fill(-1));

  // Finder patterns + separators
  placeFinder(m, 0, 0);
  placeFinder(m, size - 7, 0);
  placeFinder(m, 0, size - 7);

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    m[6][i] = (i % 2 === 0) ? 1 : 0; m[6][i] |= 2;
    m[i][6] = (i % 2 === 0) ? 1 : 0; m[i][6] |= 2;
  }

  // Alignment pattern for version 2 at (6, 18)? Standard position (18, 18)
  placeAlignment(m, 18, 18);

  // Reserve format info areas
  reserveFormat(m);

  // Dark module
  m[8][(4 * 2) + 9] = 1; // row 8, col 17

  // Data placement (bottom-right upward zigzag), mask later
  let row = size - 1;
  let col = size - 1;
  let dirUp = true;
  let bitIdx = 0;
  while (col > 0) {
    if (col === 6) col--; // skip timing column
    for (let r = 0; r < size; r++) {
      const rr = dirUp ? (size - 1 - r) : r;
      for (let c = 0; c < 2; c++) {
        const cc = col - c;
        if (m[rr][cc] !== -1) continue; // reserved
        const bit = bits[bitIdx++] || 0;
        m[rr][cc] = bit; // temporary raw bit
      }
    }
    dirUp = !dirUp;
    col -= 2;
  }

  // Apply mask pattern 0: (r + c) % 2 == 0
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (m[r][c] === 0 || m[r][c] === 1) {
        if ((r + c) % 2 === 0) m[r][c] ^= 1;
      }
    }
  }

  // Place format info for ECC L (01) and mask 0 (000)
  placeFormatInfo(m, 0);

  // Convert reserved marks (2) into final black/white (keep as is)
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (m[r][c] === 2) m[r][c] = (m[r][c] & 1) as number; // just ensure non -1
      if (m[r][c] === -1) m[r][c] = 0;
    }
  }

  return m;
}

function placeFinder(m: number[][], x: number, y: number) {
  for (let r = -1; r <= 7; r++) {
    for (let c = -1; c <= 7; c++) {
      const rr = y + r, cc = x + c;
      if (rr < 0 || rr >= m.length || cc < 0 || cc >= m.length) continue;
      const in7 = r >= 0 && r <= 6 && c >= 0 && c <= 6;
      const onBorder = r === 0 || r === 6 || c === 0 || c === 6;
      const in3 = r >= 2 && r <= 4 && c >= 2 && c <= 4;
      m[rr][cc] = in7 && (onBorder || in3) ? 1 : 0;
      if (!in7) m[rr][cc] = 0; // separator
      m[rr][cc] |= 2; // reserve
    }
  }
}

function placeAlignment(m: number[][], x: number, y: number) {
  for (let r = -2; r <= 2; r++) {
    for (let c = -2; c <= 2; c++) {
      const rr = y + r, cc = x + c;
      if (rr < 0 || rr >= m.length || cc < 0 || cc >= m.length) continue;
      const dist = Math.max(Math.abs(r), Math.abs(c));
      m[rr][cc] = (dist === 2 || (r === 0 && c === 0)) ? 1 : (dist === 1 ? 0 : m[rr][cc]);
      m[rr][cc] |= 2;
    }
  }
}

function reserveFormat(m: number[][]) {
  const n = m.length;
  for (let i = 0; i < 9; i++) {
    if (i !== 6) { m[8][i] = m[8][i] === -1 ? 0 : m[8][i]; m[8][i] |= 2; }
    if (i !== 6) { m[i][8] = m[i][8] === -1 ? 0 : m[i][8]; m[i][8] |= 2; }
  }
  for (let i = n - 8; i < n; i++) { m[8][i] = m[8][i] === -1 ? 0 : m[8][i]; m[8][i] |= 2; }
  for (let i = n - 8; i < n; i++) { m[i][8] = m[i][8] === -1 ? 0 : m[i][8]; m[i][8] |= 2; }
}

function placeFormatInfo(m: number[][], mask: number) {
  // Precomputed 15-bit format string for ECC L (01) and mask 0..7, masked with 0x5412.
  // For mask 0, format bits = 0b111011111000100 (0x77C4)
  const formatBits = 0x77C4; // L + mask0
  const n = m.length;
  // Place around top-left and other required positions per spec
  // Top-left timing row/column
  for (let i = 0; i <= 5; i++) m[8][i] = ((formatBits >> i) & 1);
  m[8][7] = ((formatBits >> 6) & 1);
  m[8][8] = ((formatBits >> 7) & 1);
  m[7][8] = ((formatBits >> 8) & 1);
  for (let i = 9; i <= 14; i++) m[14 - i][8] = ((formatBits >> i) & 1);

  // Other side
  for (let i = 0; i <= 7; i++) m[n - 1 - i][8] = m[n - 1 - i][8]; // already reserved
  for (let i = 0; i <= 5; i++) m[i][8] = m[i][8];

  // Right and bottom format
  for (let i = 0; i <= 5; i++) m[i][n - 1 - 8] = ((formatBits >> i) & 1);
  m[7][n - 1 - 8] = ((formatBits >> 6) & 1);
  m[8][n - 1 - 8] = ((formatBits >> 7) & 1);
  for (let i = 8; i <= 14; i++) m[n - 1 - 8][n - 15 + i] = ((formatBits >> i) & 1);
}

function buildVersion2L(text: string): number[][] {
  // Capacity for version 2-L: 34 data codewords, 10 EC codewords, total 44
  const isAlnum = /^[0-9A-Z $%*+\-.\/:]*$/.test(text);
  const bits = isAlnum ? encodeAlphanumericBits(text) : encodeByteBits(text);
  // Terminator up to 4 bits
  const MAX_DATA_BYTES = 34;
  const MAX_DATA_BITS = MAX_DATA_BYTES * 8;
  const terminator = Math.min(4, Math.max(0, MAX_DATA_BITS - bits.length));
  for (let i = 0; i < terminator; i++) bits.push(0);
  // Pad to byte
  while (bits.length % 8 !== 0) bits.push(0);
  const data: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    let b = 0;
    for (let j = 0; j < 8; j++) b = (b << 1) | bits[i + j];
    data.push(b);
  }
  // Pad codewords 0xEC, 0x11
  const PAD = [0xEC, 0x11];
  let padIdx = 0;
  while (data.length < MAX_DATA_BYTES) {
    data.push(PAD[padIdx % 2]);
    padIdx++;
  }
  // ECC (single block)
  const ec = rsComputeECC(data, 10);
  const codewords = data.concat(ec);
  // Convert to bitstream for placement (MSB-first per codeword)
  const cwBits: number[] = [];
  for (const cw of codewords) pushBits(cwBits, cw, 8);
  return makeMatrix(cwBits, 25);
}

const QrCode: React.FC<Props> = ({ value, size = 96, className, title, fgColor = '#0f172a', bgColor = '#ffffff', quietZoneModules = 4 }) => {
  const matrix = React.useMemo(() => buildVersion2L(value || ''), [value]);
  const n = matrix.length;
  const quiet = Math.max(0, quietZoneModules);
  const scale = Math.floor(size / (n + 2 * quiet)) || 4;
  const dim = (n + 2 * quiet) * scale;
  return (
    <svg
      width={dim}
      height={dim}
      viewBox={`0 0 ${dim} ${dim}`}
      role="img"
      aria-label={`QR Code pour ${value}`}
      className={className}
      shapeRendering="crispEdges"
    >
      {title && <title>{title}</title>}
      <rect x={0} y={0} width={dim} height={dim} fill={bgColor} />
      {matrix.map((row, y) => row.map((v, x) => (
        v ? <rect key={`${x}-${y}`} x={(x + quiet) * scale} y={(y + quiet) * scale} width={scale} height={scale} fill={fgColor} /> : null
      )))}
    </svg>
  );
};

export default QrCode;
