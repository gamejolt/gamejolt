import { getCurrentServerTime } from './server-time';
export type RequireContextMap = { [k: string]: string };

export function loadScript(src: string, { crossOrigin }: { crossOrigin?: string } = {}) {
	return new Promise<Event>((resolve, reject) => {
		const script = window.document.createElement('script');
		script.type = 'text/javascript';
		script.async = true;

		if (crossOrigin) {
			script.crossOrigin = crossOrigin;
		}

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
	return debounceWithCancel(fn, delayMs).call;
}

/**
 * Allows manual canceling of the debounce.
 */
export function debounceWithCancel<T extends FunctionType>(
	fn: T,
	delayMs: number
): { call: ChangeReturnType<T, void>; cancel: () => void } {
	let timeout: NodeJS.Timer | null = null;

	function cancel() {
		if (timeout) {
			clearTimeout(timeout);
		}
	}

	return {
		call(this: unknown, ...args: any) {
			cancel();

			timeout = setTimeout(() => {
				timeout = null;
				fn.apply(this, args);
			}, delayMs);
		},
		cancel,
	};
}

export function debounceWithMaxTimeout<T extends FunctionType>(
	fn: T,
	delayMs: number,
	maxTimeoutMs: number
): { call: ChangeReturnType<T, void>; cancel: () => void } {
	let timeout: NodeJS.Timer | null = null;
	let totalDelay: number | null = null;
	let lastCallTime: number | null = null;

	function cancel() {
		if (timeout) {
			clearTimeout(timeout);
		}
	}

	return {
		call(this: unknown, ...args: any) {
			const handleCallback = () => {
				timeout = null;
				totalDelay = null;
				lastCallTime = null;
				fn.apply(this, args);
			};

			cancel();

			const now = getCurrentServerTime();
			const last = lastCallTime ?? now;
			lastCallTime = now;

			const total = totalDelay === null ? 0 : totalDelay + now - last;
			totalDelay = total;

			const effectiveDelay = Math.min(delayMs, maxTimeoutMs - total);
			if (effectiveDelay <= 0) {
				handleCallback();
			} else {
				timeout = setTimeout(handleCallback, effectiveDelay);
			}
		},
		cancel,
	};
}

export function queuedThrottle(delay: number) {
	let _delayTimer: Promise<void> | null = null;

	return {
		async call(cb: () => Promise<void>) {
			if (_delayTimer) {
				await _delayTimer;
			}

			await cb();

			// We will wait at least this long before the next call.
			_delayTimer = new Promise(resolve =>
				setTimeout(() => {
					_delayTimer = null;
					resolve();
				}, delay)
			);
		},
	};
}

// For exhaustive switch matching: https://www.typescriptlang.org/docs/handbook/advanced-types.html
export function assertNever(x: never): never {
	throw new Error('Unexpected object: ' + x);
}

/**
 * Use when you need to call a function when doing an instanceof check. It can
 * help resolve a bug in volar where the templates break with instanceof.
 */
export function isInstance<T>(item: any, constructor: new (...data: any) => T): item is T {
	return item instanceof constructor;
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

/**
 * Utility type that requires at least one of the keys in T to be present.
 */
export type RequireAtLeastOne<T> = {
	[K in keyof T]-?: Required<Pick<T, K>> & Partial<T>;
}[keyof T];
