
import { CURRENCY_RATES } from '../constants.ts';

export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
    const rate = CURRENCY_RATES[currency] || 1;
    const convertedAmount = amount * rate;

    // Formatting rules per currency
    if (currency === 'BIF') {
        return `FBu ${Math.round(convertedAmount).toLocaleString()}`;
    } else if (currency === 'EUR') {
        return `€${convertedAmount.toFixed(2)}`;
    }
    
    return `$${convertedAmount.toFixed(2)}`;
};

export const convertPrice = (amount: number, currency: string = 'USD'): number => {
    const rate = CURRENCY_RATES[currency] || 1;
    return amount * rate;
};
