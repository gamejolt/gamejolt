import { inject, InjectionKey, markRaw, shallowRef, toRaw, triggerRef } from 'vue';
import { arrayRemove } from '../../../utils/array';
import { FiresideController } from './controller/controller';

export const FiresideStoreKey: InjectionKey<FiresideStore> = Symbol('fireside-store');

export type FiresideStore = ReturnType<typeof createFiresideStore>;

export function useFiresideStore() {
	return inject(FiresideStoreKey)!;
}

export function createFiresideStore() {
	const firesides = shallowRef<FiresideController[]>([]);

	function addFireside(controller: FiresideController) {
		const item = toRaw(controller);
		const index = firesides.value.indexOf(item);

		if (index === -1) {
			firesides.value.push(markRaw(item));
			triggerRef(firesides);
		}
	}

	function removeFireside(controller: FiresideController) {
		const item = toRaw(controller);
		const result = arrayRemove(firesides.value, i => i === item);

		if (result) {
			// TODO(global-firesides) Only cleanup if we're not using the controller anymore. May want to add locks to FiresideController so we know when it's unused.
			item.cleanup();
			triggerRef(firesides);
		}
	}

	return {
		firesides,
		addFireside,
		removeFireside,
	};
}
