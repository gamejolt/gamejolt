import AppNoop from './AppNoop.vue';

export function lazyImportNoSSR<T>(fn: () => Promise<T>): () => Promise<T> {
	return () => importNoSSR(fn);
}

export function importNoSSR<T>(fn: () => Promise<T>): Promise<T> {
	if (import.meta.env.SSR) {
		return Promise.resolve(AppNoop as any);
	}

	return fn();
}

export function lazyImportOnlySSR<T>(fn: () => Promise<T>): () => Promise<T> {
	return () => importOnlySSR(fn);
}

export function importOnlySSR<T>(fn: () => Promise<T>): Promise<T> {
	if (!import.meta.env.SSR) {
		return Promise.resolve(AppNoop as any);
	}

	return fn();
}
