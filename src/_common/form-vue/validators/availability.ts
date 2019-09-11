import { Api } from '../../api/api.service';

export interface AvailabilityCheck {
	url: string;
	initVal?: string;
}
export async function FormValidatorAvailability(value: string, args: [AvailabilityCheck]) {
	// Skip the check if our initial value still isn't set yet.
	// The validator runs before the initial value gets set, so skip it if we haven't gotten the initialVal yet.
	if (args[0].initVal && args[0].initVal === value) {
		return { valid: true };
	}

	try {
		await Api.sendRequest(args[0].url, { value }, { detach: true, processPayload: false });
	} catch (_e) {
		return { valid: false };
	}

	return { valid: true };
}
