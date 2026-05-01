import type { AsyncLocalStorage } from 'node:async_hooks';

type Store = Map<symbol, any>;

let als: AsyncLocalStorage<Store> | null = null;

/**
 * Wires up the AsyncLocalStorage instance used to isolate per-request state in
 * SSR. Called once from each section's Node entry (e.g. `src/app/server.ts`).
 * The browser build tree-shakes all references to this.
 */
export function initIsolatedScope(instance: AsyncLocalStorage<Store>) {
	als = instance;
}

/**
 * Runs `fn` inside a fresh per-request state scope. Every value declared via
 * `defineIsolatedState` that is read inside `fn` is scoped to this run.
 *
 * SSR only — `initIsolatedScope` must have been called first.
 */
export function runInIsolatedScope<T>(fn: () => T): T {
	if (!als) {
		throw new Error(
			`runInIsolatedScope called without initIsolatedScope. Call initIsolatedScope() during SSR bootstrap.`
		);
	}
	return als.run(new Map(), fn);
}

/**
 * Declares a piece of module-level state that is:
 *
 * - In the browser: a single lazily-initialized singleton. There is only one
 *   consumer (the current document), so a plain module global is correct.
 * - In SSR: isolated per request via AsyncLocalStorage, so concurrent requests
 *   never share state. Accessing the state outside of `runInIsolatedScope`
 *   throws — SSR code must always run inside a request scope.
 *
 * `factory` runs once per scope (once total in the browser, once per request
 * in SSR).
 */
export function defineIsolatedState<T>(factory: () => T): () => T {
	if (!import.meta.env.SSR) {
		let value: T;
		let initialized = false;
		return () => {
			if (!initialized) {
				value = factory();
				initialized = true;
			}
			return value;
		};
	}

	const key = Symbol('isolated-state');
	return () => {
		const store = als?.getStore();
		if (!store) {
			throw new Error(
				`Isolated state accessed outside of runInIsolatedScope. Every SSR code path must execute inside the request scope set up by the section's server.ts.`
			);
		}
		if (!store.has(key)) {
			store.set(key, factory());
		}
		return store.get(key) as T;
	};
}
