import React from 'react';
import { motion } from 'framer-motion';

export interface Currency {
  code: string;
  symbol: string;
  rate: number; // Rate relative to GBP (GBP = 1.0)
  flag: string;
}

interface CurrencySelectorProps {
  selectedCurrency: string;
  onCurrencyChange: (currencyCode: string) => void;
}

const CURRENCIES: Currency[] = [
  { code: 'GBP', symbol: '£', rate: 1.0, flag: '🇬🇧' },
  { code: 'USD', symbol: '$', rate: 1.27, flag: '🇺🇸' },
  { code: 'EUR', symbol: '€', rate: 1.16, flag: '🇪🇺' },
];

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  selectedCurrency,
  onCurrencyChange,
}) => {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      <span className="text-sm text-gray-600 mr-2">Currency:</span>
      <div className="flex bg-gray-100 rounded-lg p-1">
        {CURRENCIES.map((currency) => (
          <motion.button
            key={currency.code}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onCurrencyChange(currency.code)}
            className={`px-4 py-2 rounded-md transition-all ${
              selectedCurrency === currency.code
                ? 'bg-white text-green-600 font-semibold shadow-md'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span className="mr-1">{currency.flag}</span>
            {currency.code}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export const convertPrice = (priceGBP: number, targetCurrency: string): number => {
  const currency = CURRENCIES.find((c) => c.code === targetCurrency);
  if (!currency) return priceGBP;
  return Math.round(priceGBP * currency.rate * 100) / 100;
};

export const getCurrencySymbol = (currencyCode: string): string => {
  const currency = CURRENCIES.find((c) => c.code === currencyCode);
  return currency?.symbol || '£';
};

export { CURRENCIES };
