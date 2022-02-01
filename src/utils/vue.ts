import { Ref, shallowRef } from 'vue';
import { setup } from 'vue-class-component';

export type MaybeRef<T> = Ref<T> | T;

/**
 * Runs [setup], wrapping the callback value in a [shallowRef].
 */
export function shallowSetup<T>(cb: () => T) {
	return setup(() => {
		return shallowRef<T>(cb());
	});
}
