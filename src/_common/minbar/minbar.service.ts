import { reactive } from 'vue';

import { arrayRemove } from '~utils/array';

export interface MinbarItem {
	id: number;
	isActive?: boolean;
	notificationCount?: number;
	title: string;
	thumb: string;
	onClick?: () => void;
}

class MinbarService {
	items: MinbarItem[] = [];
}

export const Minbar = reactive(/** @__PURE__ */ new MinbarService()) as MinbarService;

let _nextItemId = 0;

export function addMinbarItem(item: Omit<MinbarItem, 'id'>) {
	const withId: MinbarItem = { ...item, id: ++_nextItemId };
	Minbar.items.push(withId);
	return withId;
}

export function removeMinbarItem(item: MinbarItem) {
	arrayRemove(Minbar.items, i => i.id === item.id);
}
