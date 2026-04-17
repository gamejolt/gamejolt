import type { Ref } from 'vue';

/**
 * Takes a possibly undefined/null ref and returns a typed version that is not
 * null.
 *
 * @__NO_SIDE_EFFECTS__
 */
export function bangRef<T>(ref: Ref<T | undefined | null>) {
	return ref as Ref<T>;
}
