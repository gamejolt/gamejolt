import { DeepReadonly, Ref, WatchOptionsBase, readonly, ref, watchEffect } from 'vue';

/**
 * Returns a readonly ref that only notifies when the watcher changes the ref.
 *
 * This solves issues with `computed` where it always notifies based on
 * dependencies changing instead of the value changing.
 */
export function watched<T>(getter: () => T, options?: WatchOptionsBase): DeepReadonly<Ref<T>> {
	const cachedResult = ref() as Ref<T>;
	watchEffect(() => {
		cachedResult.value = getter();
	}, options);
	return readonly(cachedResult);
}
