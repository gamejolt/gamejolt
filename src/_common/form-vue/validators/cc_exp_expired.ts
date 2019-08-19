import { isValid, parse } from './_exp';

export function FormValidatorCcExpExpired(value: string) {
	if (!value) {
		return true;
	}

	if (!isValid(value)) {
		return true;
	}

	const parsed = parse(value);

	// Months are 0-based.
	// This means it will correctly push into the next month with their input
	// so that it invalidates at the beginning of the next month.
	return Date.now() < new Date(parsed.y, parsed.m).getTime();
}
