import { isError } from 'util';

export type RequireContextMap = { [k: string]: string };

export function importContext(r: WebpackContext) {
	let map: RequireContextMap = {};
	r.keys().forEach(key => (map[key] = r(key)));
	return map;
}

export function asyncComponentLoader(loader: Promise<any>) {
	return loader.then(mod => mod.default);
}

export function loadScript(src: string) {
	return new Promise((resolve, reject) => {
		const script = window.document.createElement('script');
		script.type = 'text/javascript';
		script.async = true;

		const docHead = window.document.head || window.document.getElementsByTagName('head')[0];
		docHead.appendChild(script);

		script.onload = resolve;
		script.onerror = reject;
		script.src = src;
	});
}

export function sleep(ms: number) {
	return new Promise(resolve => {
		setTimeout(resolve, ms);
	});
}

// A function type, because Function is actually an interface and not a true type.
type FunctionType = (...args: any) => any;

// Changes the return type of a given function.
type ChangeReturnType<T extends FunctionType, U> = (...args: Parameters<T>) => U;

/**
 * Debounces `fn` by `delayMs`.
 */
export function debounce<T extends FunctionType>(
	fn: T,
	delayMs: number
): ChangeReturnType<T, void> {
	let timeout: NodeJS.Timer | null = null;

	return function(this: unknown, ...args: any) {
		if (timeout) {
			clearTimeout(timeout);
		}

		timeout = setTimeout(() => {
			timeout = null;
			fn.apply(this, args);
		}, delayMs);
	};
}

// For exhaustive switch matching: https://www.typescriptlang.org/docs/handbook/advanced-types.html
export function assertNever(x: never): never {
	throw new Error('Unexpected object: ' + x);
}

export type Primitives = Number | String | Boolean;
export type Properties<T, U> = { [K in keyof T]: T[K] extends U ? K : never }[keyof T];

export function isErrnoException(err: any): err is NodeJS.ErrnoException {
	return isError(err) && typeof (err as any).code === 'string' && !!(err as any).code;
}

export function isPromise(obj: any) {
	return (
		!!obj &&
		(typeof obj === 'object' || typeof obj === 'function') &&
		typeof obj.then === 'function'
	);
}

export function isMac() {
	return typeof navigator != 'undefined' ? /Mac/.test(navigator.platform) : false;
}
