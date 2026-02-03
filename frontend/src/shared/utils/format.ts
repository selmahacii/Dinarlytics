export const toNumber = (n: unknown, fallback = 0): number => {
  if (typeof n === 'number' && isFinite(n)) return n;
  if (typeof n === 'string') {
    const trimmed = n.trim().replace(/\s/g, '').replace(/,/, '.');
    const parsed = Number(trimmed);
    if (!isNaN(parsed) && isFinite(parsed)) return parsed;
  }
  return fallback;
};

export const formatNumber = (n: unknown, locale: string = 'fr-FR'): string => {
  const num = toNumber(n, 0);
  try {
    return num.toLocaleString(locale);
  } catch {
    return String(num);
  }
};

export const formatCurrencySimple = (n: unknown, suffix = 'DA', locale: string = 'fr-FR'): string => {
  return `${formatNumber(n, locale)} ${suffix}`.trim();
};

export const formatCurrency = (
  value: unknown,
  locale: string = 'fr-DZ',
  currency: string = 'DZD',
  maximumFractionDigits: number = 0
): string => {
  const num = toNumber(value, 0);
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits,
    }).format(num);
  } catch {
    return `${formatNumber(num, locale)} ${currency}`;
  }
};
