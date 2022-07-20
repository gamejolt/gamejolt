export type RequireContextMap = { [k: string]: string };

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

/**
 * Allows you to run a function passed in. Mostly used for running async
 * functions that will return a promise in a flow.
 *
 * Example:
 * ```
 * await Promise.all([run(async () => ...), run(async () => ...)]);
 * ```
 */
export function run<T>(fn: () => T) {
	return fn();
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

	return function (this: unknown, ...args: any) {
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

export type Primitives = number | string | boolean;
export type Properties<T, U> = { [K in keyof T]: T[K] extends U ? K : never }[keyof T];

export type MaybePromise<T> = T | Promise<T> | PromiseLike<T>;

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

// Prefixes T with a prefix TPrefix.
// Example: Prefixed<'world', 'hello '> = 'hello world'
type Prefixed<T, TPrefix> = T extends string
	? TPrefix extends string
		? `${TPrefix}${T}`
		: never
	: never;

// Gets a union of private looking keys from a given object.
// Example: PrivateKeys<{a: 1, _b: 2, _c: 3}> = '_b' | '_c'
type PrivateKeys<T> = {
	[TKey in keyof T]: TKey extends Prefixed<any, '_'> ? TKey : never;
}[keyof T];

export type HidePrivateKeys<T> = Omit<T, PrivateKeys<T>>;
