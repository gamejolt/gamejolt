import { inject, InjectionKey, ref, shallowReadonly } from 'vue';

import { arrayRemove } from '~utils/array';

export interface MinbarItem {
	id: number;
	isActive?: boolean;
	notificationCount?: number;
	title: string;
	thumb: string;
	onClick?: () => void;
}

export const MinbarStoreKey: InjectionKey<MinbarStore> = Symbol('minbar-store');

export type MinbarStore = ReturnType<typeof createMinbarStore>;

export function useMinbarStore() {
	return inject(MinbarStoreKey)!;
}

export function createMinbarStore() {
	const items = ref<MinbarItem[]>([]);
	let _nextItemId = 0;

	function addItem(item: Omit<MinbarItem, 'id'>) {
		const withId: MinbarItem = { ...item, id: ++_nextItemId };
		if (import.meta.env.SSR) {
			return withId;
		}
		items.value.push(withId);
		return withId;
	}

	function removeItem(item: MinbarItem) {
		if (import.meta.env.SSR) {
			return;
		}
		arrayRemove(items.value, i => i.id === item.id);
	}

	return shallowReadonly({
		items,
		addItem,
		removeItem,
	});
}
