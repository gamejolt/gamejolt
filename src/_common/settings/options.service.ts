import { assertNever } from '../../utils/utils';
const STORAGE_PREFIX = 'options.';

type OptionsType = 'community-eject' | 'community-move-post' | 'community-user-block';

export function getOptions(type: OptionsType, suffix = '') {
	const id = type + (suffix ? '-' + suffix : '');
	switch (type) {
		case 'community-eject':
		case 'community-move-post':
			return new Options<string>(id, true, 10);
		case 'community-user-block':
			return new Options<string>(id, true, 20);
		default:
			assertNever(type);
	}
}

export class Options<T> {
	private _storageKey: string;
	private _checkDuplicate: boolean;
	private _maxItems: number | null;

	constructor(id: string, checkDuplicate: boolean, maxItems: number | null) {
		this._storageKey = STORAGE_PREFIX + id;
		this._checkDuplicate = checkDuplicate;
		this._maxItems = maxItems;
	}

	private _getStorageValue(): string {
		const value = localStorage.getItem(this._storageKey);
		if (value === null) {
			return '[]';
		}
		return value;
	}

	private _setStorageValue(value: string) {
		localStorage.setItem(this._storageKey, value);
	}

	public getList(): T[] {
		const list = JSON.parse(this._getStorageValue());
		if (!Array.isArray(list)) {
			return [];
		}
		return list;
	}

	public setList(list: T[]) {
		const value = JSON.stringify(list);
		this._setStorageValue(value);
	}

	public unshiftItem(item: T) {
		let list = this.getList();

		if (this._checkDuplicate && list.includes(item)) {
			// Move item to the start.
			list = list.filter(i => i !== item);
			list.unshift(item);
		} else {
			list.unshift(item);
			// Remove entries from the end of the list until maxItems is satisfied.
			if (this._maxItems !== null && this._maxItems > 0) {
				while (list.length > this._maxItems) {
					list.pop();
				}
			}
		}

		this.setList(list);
	}
}
