import { formatNumber } from './number';

export function formatCurrency(amount: number, currencyCode = 'USD', fractionDigits = 2): string {
	// No fraction if it's evenly divisible by 100.
	if (amount % 100 === 0) {
		fractionDigits = 0;
	}

	// Undefined locale should choose their default locale.
	const formatter = new Intl.NumberFormat(undefined, {
		style: 'currency',
		currency: currencyCode,
		minimumFractionDigits: fractionDigits,
		maximumFractionDigits: fractionDigits,
	});

	amount = amount / 100;
	if (fractionDigits === 0) {
		amount = Math.floor(amount);
	}

	return formatter.format(amount);
}

export function formatGemsCurrency(amount: number): string {
	return formatNumber(amount);
}
