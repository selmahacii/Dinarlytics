import React from 'react';

type Props = {
  value: string;
  height?: number; // bar height in px (bars only)
  scale?: number; // width per module in px
  className?: string;
  title?: string;
  fgColor?: string; // bar color
  bgColor?: string; // background color
  quietZoneModules?: number; // quiet zone in modules (recommended >= 10)
  showText?: boolean; // render human-readable value under bars
  textFontSize?: number; // px
  textMargin?: number; // space between bars and text (px)
};

// Code 128 patterns (107 codes). Each string: sequence of module widths (bars/spaces alternating), starting with bar.
// Source: Encoded from the Code 128 specification (public domain numerical table) transformed into width sequences.
const PATTERNS: number[][] = [
  [2,1,2,2,2,2],[2,2,2,1,2,2],[2,2,2,2,2,1],[1,2,1,2,2,3],[1,2,1,3,2,2],[1,3,1,2,2,2],[1,2,2,2,1,3],[1,2,2,3,1,2],[1,3,2,2,1,2],[2,2,1,2,1,3],
  [2,2,1,3,1,2],[2,3,1,2,1,2],[1,1,2,2,3,2],[1,2,2,1,3,2],[1,2,2,2,3,1],[1,1,3,2,2,2],[1,2,3,1,2,2],[1,2,3,2,2,1],[2,2,3,2,1,1],[2,2,1,1,3,2],
  [2,2,1,2,3,1],[2,1,3,2,1,2],[2,2,3,1,1,2],[3,1,2,1,3,1],[3,1,1,2,2,2],[3,2,1,1,2,2],[3,2,1,2,2,1],[3,1,2,2,1,2],[3,2,2,1,1,2],[3,2,2,2,1,1],
  [2,1,2,1,2,3],[2,1,2,3,2,1],[2,3,2,1,2,1],[1,1,1,3,2,3],[1,3,1,1,2,3],[1,3,1,3,2,1],[1,1,2,3,1,3],[1,3,2,1,1,3],[1,3,2,3,1,1],[2,1,1,3,1,3],
  [2,3,1,1,1,3],[2,3,1,3,1,1],[1,1,2,1,3,3],[1,1,2,3,3,1],[1,3,2,1,3,1],[1,1,3,1,2,3],[1,1,3,3,2,1],[1,3,3,1,2,1],[3,1,3,1,2,1],[2,1,1,3,3,1],
  [2,3,1,1,3,1],[2,1,3,1,1,3],[2,1,3,3,1,1],[2,1,3,1,3,1],[3,1,1,1,2,3],[3,1,1,3,2,1],[3,3,1,1,2,1],[3,1,2,1,1,3],[3,1,2,3,1,1],[3,3,2,1,1,1],
  [3,1,4,1,1,1],[2,2,1,4,1,1],[4,3,1,1,1,1],[1,1,1,2,2,4],[1,1,1,4,2,2],[1,2,1,1,2,4],[1,2,1,4,2,1],[1,4,1,1,2,2],[1,4,1,2,2,1],[1,1,2,2,1,4],
  [1,1,2,4,1,2],[1,2,2,1,1,4],[1,2,2,4,1,1],[1,4,2,1,1,2],[1,4,2,2,1,1],[2,4,1,2,1,1],[2,2,1,1,1,4],[4,1,3,1,1,1],[2,4,1,1,1,2],[1,3,4,1,1,1],
  [1,1,1,2,4,2],[1,2,1,1,4,2],[1,2,1,2,4,1],[1,1,4,2,1,2],[1,2,4,1,1,2],[1,2,4,2,1,1],[4,1,1,2,1,2],[4,2,1,1,1,2],[4,2,1,2,1,1],[2,1,2,1,4,1],
  [2,1,4,1,2,1],[4,1,2,1,2,1],[1,1,1,1,4,3],[1,1,1,3,4,1],[1,3,1,1,4,1],[1,1,4,1,1,3],[1,1,4,3,1,1],[4,1,1,1,1,3],[4,1,1,3,1,1],[1,1,3,1,4,1],
  [1,1,4,1,3,1],[3,1,1,1,4,1],[4,1,1,1,3,1],[2,1,1,4,1,2],[2,1,1,2,1,4],[2,1,1,2,3,2],[2,3,3,1,1,1,2] // 106: stop (13 modules)
];

const START_B = 104;
const START_C = 105;
const STOP = 106;

function isDigitsEven(input: string): boolean {
  return input.length >= 2 && input.length % 2 === 0 && /^\d+$/.test(input);
}

function encodeCode128(input: string): { codes: number[]; pattern: number[] } {
  if (isDigitsEven(input)) {
    // Code Set C: encode pairs of digits
    const codes: number[] = [START_C];
    for (let i = 0; i < input.length; i += 2) {
      const pair = parseInt(input.slice(i, i + 2), 10);
      codes.push(pair); // 00..99 maps to 0..99
    }
    // checksum
    let checksum = START_C;
    for (let i = 1; i < codes.length; i++) checksum += codes[i] * i;
    checksum = checksum % 103;
    codes.push(checksum);
    codes.push(STOP);

    const pattern: number[] = [];
    for (const code of codes) {
      const seq = PATTERNS[code];
      if (!seq) continue;
      for (const w of seq) pattern.push(w);
    }
    pattern.push(2, 0);
    return { codes, pattern };
  }

  // Fallback to Code Set B
  // Sanitize: restrict to ASCII 32..126; replace others with space
  const sanitized = input.split('').map(ch => {
    const c = ch.charCodeAt(0);
    return (c >= 32 && c <= 126) ? ch : ' ';
  }).join('');

  const codes: number[] = [START_B];
  for (const ch of sanitized) {
    const code = ch.charCodeAt(0) - 32; // Set B mapping
    codes.push(code);
  }
  // Checksum
  let checksum = START_B;
  for (let i = 1; i < codes.length; i++) {
    checksum += codes[i] * i;
  }
  checksum = checksum % 103;
  codes.push(checksum);
  codes.push(STOP);

  // Build pattern (concatenate module widths for each symbol)
  const pattern: number[] = [];
  for (const code of codes) {
    const seq = PATTERNS[code];
    if (!seq) continue;
    for (const w of seq) pattern.push(w);
  }
  // Add termination bar (2 modules) after stop per spec
  pattern.push(2, 0); // 2 modules bar; trailing space 0 indicates end
  return { codes, pattern };
}

const Code128: React.FC<Props> = ({
  value,
  height = 40,
  scale = 2,
  className,
  title,
  fgColor = '#0f172a',
  bgColor = '#ffffff',
  quietZoneModules = 10,
  showText = false,
  textFontSize = 12,
  textMargin = 4,
}) => {
  const { pattern } = React.useMemo(() => encodeCode128(value || ''), [value]);
  const quietPx = Math.max(0, quietZoneModules) * scale;
  let x = quietPx;
  let isBar = true;
  const bars: React.ReactNode[] = [];
  for (let i = 0; i < pattern.length; i++) {
    const w = pattern[i];
    if (w > 0 && isBar) {
      bars.push(
        <rect key={i} x={x} y={0} width={w * scale} height={height} fill={fgColor} />
      );
    }
    x += w * scale;
    isBar = !isBar;
  }
  const width = x + quietPx;
  const totalHeight = showText ? height + textMargin + textFontSize + 2 : height;

  return (
    <svg
      width={width}
      height={totalHeight}
      viewBox={`0 0 ${width} ${totalHeight}`}
      role="img"
      aria-label={`Code128 pour ${value}`}
      className={className}
      shapeRendering="crispEdges"
    >
      {title && <title>{title}</title>}
      <rect x={0} y={0} width={width} height={totalHeight} fill={bgColor} />
      {bars}
      {showText && (
        <text
          x={width / 2}
          y={height + textMargin + textFontSize * 0.85}
          fontSize={textFontSize}
          textAnchor="middle"
          fill={fgColor}
          fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
        >
          {value}
        </text>
      )}
    </svg>
  );
};

export default Code128;
