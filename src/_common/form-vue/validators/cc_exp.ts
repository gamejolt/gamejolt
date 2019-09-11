import { isValid } from './_exp';

export function FormValidatorCcExp(value: string) {
	if (!value) {
		return true;
	}

	return isValid(value);
}
