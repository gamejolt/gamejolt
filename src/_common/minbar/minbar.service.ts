import { reactive } from 'vue';
import { arrayRemove } from '../../utils/array';

export interface MinbarItem {
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

export function addMinbarItem(item: MinbarItem) {
	Minbar.items.push(item);
	return item;
}

export function removeMinbarItem(item: MinbarItem) {
	arrayRemove(Minbar.items, i => i === item);
}
