import { assertNever } from '../../utils/utils';
const STORAGE_PREFIX = 'options.';

type DatalistOptionsType = 'community-eject' | 'community-move-post' | 'community-user-block';

export function getDatalistOptions(type: DatalistOptionsType, suffix = '') {
	const id = type + (suffix ? '-' + suffix : '');
	switch (type) {
		case 'community-eject':
		case 'community-move-post':
			return new DatalistOptions<string>(id, 10);
		case 'community-user-block':
			return new DatalistOptions<string>(id, 20);
		default:
			assertNever(type);
	}
}

export class DatalistOptions<T> {
	private storageKey: string;
	private maxItems: number | null;

	constructor(id: string, maxItems: number | null) {
		this.storageKey = STORAGE_PREFIX + id;
		this.maxItems = maxItems;
	}

	private getStorageValue(): string {
		const value = localStorage.getItem(this.storageKey);
		if (value === null) {
			return '[]';
		}
		return value;
	}

	private setStorageValue(value: string) {
		localStorage.setItem(this.storageKey, value);
	}

	public getList(): T[] {
		const list = JSON.parse(this.getStorageValue());
		if (!Array.isArray(list)) {
			return [];
		}
		return list;
	}

	private setList(list: T[]) {
		const value = JSON.stringify(list);
		this.setStorageValue(value);
	}

	public unshiftItem(item: T) {
		let list = this.getList();

		if (list.includes(item)) {
			// Move item to the start.
			list = list.filter(i => i !== item);
			list.unshift(item);
		} else {
			list.unshift(item);
			// Remove entries from the end of the list until maxItems is satisfied.
			if (this.maxItems !== null && this.maxItems > 0) {
				while (list.length > this.maxItems) {
					list.pop();
				}
			}
		}

		this.setList(list);
	}
}
