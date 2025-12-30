import { prisma } from '../db/client';

/**
 * Currency Service
 * Handles currency conversion operations with cached exchange rates
 */

const CACHE_DURATION_HOURS = 24; // Cache rates for 24 hours

/**
 * Get all available currency rates
 */
export async function getAllCurrencies() {
  const currencies = await prisma.currencyRate.findMany({
    select: {
      code: true,
      name: true,
      symbol: true,
      rateToUSD: true,
      lastUpdated: true,
    },
    orderBy: {
      code: 'asc',
    },
  });

  return {
    currencies,
    lastUpdated: currencies[0]?.lastUpdated || new Date(),
  };
}

/**
 * Get a specific currency by code
 */
export async function getCurrencyByCode(code: string) {
  const currency = await prisma.currencyRate.findUnique({
    where: { code: code.toUpperCase() },
  });

  return currency;
}

/**
 * Convert currency from one to another
 */
export async function convertCurrency(from: string, to: string, amount: number) {
  // Validate inputs
  if (!from || !to || amount <= 0) {
    throw new Error('Invalid conversion parameters');
  }

  const fromCode = from.toUpperCase();
  const toCode = to.toUpperCase();

  // If converting to same currency, return as-is
  if (fromCode === toCode) {
    return {
      from: { code: fromCode, amount },
      to: { code: toCode, amount },
      rate: 1,
      lastUpdated: new Date(),
      disclaimer: 'Rates are for reference only. Verify with financial institutions for transactions.',
    };
  }

  // Fetch both currencies
  const [fromCurrency, toCurrency] = await Promise.all([
    getCurrencyByCode(fromCode),
    getCurrencyByCode(toCode),
  ]);

  if (!fromCurrency) {
    throw new Error(`Currency ${fromCode} not found`);
  }

  if (!toCurrency) {
    throw new Error(`Currency ${toCode} not found`);
  }

  // Convert via USD (base currency)
  // 1. Convert from source to USD
  const amountInUSD = amount / fromCurrency.rateToUSD;

  // 2. Convert from USD to target
  const convertedAmount = amountInUSD * toCurrency.rateToUSD;

  // Calculate direct rate
  const directRate = toCurrency.rateToUSD / fromCurrency.rateToUSD;

  return {
    from: {
      code: fromCode,
      amount,
      name: fromCurrency.name,
      symbol: fromCurrency.symbol,
    },
    to: {
      code: toCode,
      amount: parseFloat(convertedAmount.toFixed(2)),
      name: toCurrency.name,
      symbol: toCurrency.symbol,
    },
    rate: parseFloat(directRate.toFixed(6)),
    lastUpdated: new Date(Math.min(
      fromCurrency.lastUpdated.getTime(),
      toCurrency.lastUpdated.getTime()
    )),
    disclaimer: 'Rates are for reference only. Verify with financial institutions for transactions.',
  };
}

/**
 * Check if currency rates need updating
 */
export async function shouldUpdateRates(): Promise<boolean> {
  const latestRate = await prisma.currencyRate.findFirst({
    orderBy: {
      lastUpdated: 'desc',
    },
    select: {
      lastUpdated: true,
    },
  });

  if (!latestRate) {
    return true; // No rates exist, need to seed
  }

  const hoursSinceUpdate = (Date.now() - latestRate.lastUpdated.getTime()) / (1000 * 60 * 60);
  return hoursSinceUpdate >= CACHE_DURATION_HOURS;
}

/**
 * Update a specific currency rate
 * Note: In production, this would fetch from an external API
 */
export async function updateCurrencyRate(code: string, rateToUSD: number) {
  return await prisma.currencyRate.update({
    where: { code: code.toUpperCase() },
    data: {
      rateToUSD,
      lastUpdated: new Date(),
    },
  });
}

/**
 * Batch update currency rates
 * Note: In production, this would fetch from an external API like exchangerate-api.com
 */
export async function batchUpdateRates(rates: Record<string, number>) {
  const updates = Object.entries(rates).map(([code, rateToUSD]) =>
    prisma.currencyRate.update({
      where: { code: code.toUpperCase() },
      data: {
        rateToUSD,
        lastUpdated: new Date(),
      },
    }).catch(() => null) // Ignore errors for non-existent currencies
  );

  await Promise.all(updates);
}
