export function number(num: number, options?: Intl.NumberFormatOptions) {
	// Undefined locale should choose their default locale.
	return new Intl.NumberFormat(undefined, options).format(num || 0);
}
