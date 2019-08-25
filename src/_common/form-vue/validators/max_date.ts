export function FormValidatorMaxDate(value: number, args: [number]) {
	return value <= args[0];
}
