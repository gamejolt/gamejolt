import { ComputedRef, Ref, shallowRef } from 'vue';
import { setup } from 'vue-class-component';

export type MaybeRef<T> = Ref<T> | T;
export type MaybeComputedRef<T> = ComputedRef<T> | T;

/**
 * Runs [setup], wrapping the callback value in a [shallowRef].
 */
export function shallowSetup<T>(cb: () => T) {
	return setup(() => {
		return shallowRef<T>(cb());
	});
}

/**
 * Takes a possibly undefined/null ref and returns a typed version that is not
 * null.
 */
export function bangRef<T>(ref: Ref<T | undefined | null>) {
	return ref as Ref<T>;
}
