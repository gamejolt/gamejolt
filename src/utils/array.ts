export function arrayUnique<T>(values: T[]) {
	return values.filter((value, index) => {
		return values.indexOf(value) === index;
	});
}

/**
 * Safe way to assign values from newArray to arr without triggering refs twice.
 *
 * For some reason, even for watchers with the default flush behaviour calling
 * splice(0) followed immediately by a push triggers the ref twice.
 */
export function arrayAssignAll<T>(arr: T[], newArray: T[]): void {
	arr.splice(0, arr.length, ...newArray);
}

export function stringSort(a: string, b: string) {
	return stringSortRaw(a.toLowerCase(), b.toLowerCase());
}

export function stringSortRaw(a: string, b: string) {
	if (a < b) {
		return -1;
	} else if (a > b) {
		return 1;
	}
	return 0;
}

export function numberSort(a: number, b: number) {
	if (a < b) {
		return -1;
	} else if (a > b) {
		return 1;
	}
	return 0;
}

export function arrayIndexBy<T>(values: T[], field: keyof T): { [k: string]: T } {
	const indexed: any = {};
	values.forEach(item => (indexed[item[field] + ''] = item));
	return indexed;
}

export function arrayIndexByFunc<T>(values: T[], fn: (item: T) => any): { [k: string]: T } {
	const indexed: any = {};
	values.forEach(item => (indexed[fn(item) + ''] = item));
	return indexed;
}

export function arrayGroupBy<T>(values: T[], field: keyof T): { [k: string]: T[] } {
	const indexed: { [k: string]: T[] } = {};
	values.forEach(item => {
		const k = item[field] + '';
		const arr = indexed[k];
		if (arr) {
			arr.push(item);
		} else {
			indexed[k] = [item];
		}
	});
	return indexed;
}

export function arrayRemove<T>(arr: T[], predicate: (v: T) => boolean) {
	const idx = arr.findIndex(predicate);
	if (idx !== -1) {
		return arr.splice(idx, 1);
	}
}

export function arrayChunk<T>(arr: T[], size: number): T[][] {
	const arrays: T[][] = [];
	while (arr.length > 0) {
		arrays.push(arr.splice(0, size));
	}
	return arrays;
}

// Based off of https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle#The_modern_algorithm
export function arrayShuffle<T>(arr: T[]): T[] {
	if (!arr.length) {
		return arr;
	}

	let j, tmp;

	for (let i = arr.length - 1; i !== 0; i--) {
		j = Math.floor(Math.random() * (i + 1));

		tmp = arr[i];
		arr[i] = arr[j];
		arr[j] = tmp;
	}

	return arr;
}
