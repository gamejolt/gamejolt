import { DeepReadonly, Ref, WatchOptionsBase, readonly, ref, watchEffect } from 'vue';
import { Primitives } from '../utils/utils';

/**
 * Returns a computed that only notifies when the value changes.
 */
export function cachedComputed<T extends Primitives>(
	getter: () => T,
	options?: WatchOptionsBase
): DeepReadonly<Ref<T>> {
	const cachedResult = ref() as Ref<T>;
	watchEffect(() => {
		cachedResult.value = getter();
	}, options);
	return readonly(cachedResult);
}
