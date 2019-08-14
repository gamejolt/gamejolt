export function forEach<T>(values: { [k: string]: T }, fn: (val: T, key: string) => void) {
	Object.keys(values).forEach(key => {
		const val = values[key];
		fn(val, key);
	});
}
