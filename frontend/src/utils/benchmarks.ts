export type Segment = 'micro' | 'small' | 'medium' | 'large' | 'enterprise';

export interface BenchmarkInput {
  segment: Segment;
  companyType?: string;
  sector?: string;
}

export interface Benchmarks {
  dsoMax: number;
  dioMax: number;
  dpoMin: number;
  liqGenMin: number;
  liqQuickMin: number;
  marginMin: number;
}

// Shared benchmark logic aligned with ChatbotLIA thresholds
export function getBenchmarks(input: BenchmarkInput): Benchmarks {
  const seg = input.segment;
  const type = (input.companyType || '').toLowerCase();
  const sec = (input.sector || 'general').toLowerCase();

  let dsoMax = 45, dioMax = 60, dpoMin = 40, liqGenMin = 1.2, liqQuickMin = 1.0, marginMin = 18;
  if (seg === 'micro') { dsoMax = 45; dioMax = 60; dpoMin = 30; liqGenMin = 1.1; liqQuickMin = 0.9; marginMin = 15; }
  if (seg === 'small')  { dsoMax = 45; dioMax = 60; dpoMin = 40; liqGenMin = 1.2; liqQuickMin = 1.0; marginMin = 18; }
  if (seg === 'medium') { dsoMax = 40; dioMax = 55; dpoMin = 45; liqGenMin = 1.3; liqQuickMin = 1.1; marginMin = 20; }
  if (seg === 'large')  { dsoMax = 38; dioMax = 50; dpoMin = 48; liqGenMin = 1.35; liqQuickMin = 1.15; marginMin = 20; }
  if (seg === 'enterprise') { dsoMax = 35; dioMax = 50; dpoMin = 50; liqGenMin = 1.4; liqQuickMin = 1.2; marginMin = 22; }
  if (type === 'spa') { dpoMin += 2; liqGenMin += 0.05; }

  switch (sec) {
    case 'retail':
    case 'commerce':
      dsoMax += 0; dioMax -= 5; dpoMin += 2; marginMin = Math.max(marginMin, 16); break;
    case 'distribution':
      dsoMax += 0; dioMax += 0; dpoMin += 2; marginMin = Math.max(marginMin, 17); break;
    case 'manufacturing':
    case 'industrie':
      dioMax += 15; dpoMin += 3; marginMin = Math.max(marginMin, 18); break;
    case 'services':
      dioMax = Math.min(dioMax, 30); dsoMax -= 5; marginMin = Math.max(marginMin, 20); break;
    case 'software':
    case 'saas':
      dsoMax -= 5; dioMax = 0; marginMin = Math.max(marginMin, 25); liqGenMin += 0.05; break;
    case 'construction':
      dsoMax += 10; dioMax += 10; dpoMin += 0; marginMin = Math.max(marginMin, 18); break;
    case 'health':
    case 'santé':
      dsoMax += 5; dioMax += 5; marginMin = Math.max(marginMin, 20); break;
    default:
      break;
  }
  return { dsoMax, dioMax, dpoMin, liqGenMin, liqQuickMin, marginMin };
}
