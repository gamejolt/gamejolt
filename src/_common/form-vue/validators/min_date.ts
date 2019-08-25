export function FormValidatorMinDate(value: number, args: [number]) {
	return value >= args[0];
}
