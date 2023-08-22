export function lazyImportNoSSR<T>(fn: () => Promise<T>): () => Promise<T> {
	return () => importNoSSR(fn);
}

export function importNoSSR<T>(fn: () => Promise<T>): Promise<T> {
	if (import.meta.env.SSR) {
		return Promise.resolve({} as any);
	}

	return fn();
}

export function lazyImportOnlySSR<T>(fn: () => Promise<T>): () => Promise<T> {
	return () => importOnlySSR(fn);
}

export function importOnlySSR<T>(fn: () => Promise<T>): Promise<T> {
	if (!import.meta.env.SSR) {
		return Promise.resolve({} as any);
	}

	return fn();
}

export function lazyImportNoDesktopApp<T>(fn: () => Promise<T>): () => Promise<T> {
	return () => importNoDesktopApp(fn);
}

export function importNoDesktopApp<T>(fn: () => Promise<T>): Promise<T> {
	if (GJ_IS_DESKTOP_APP) {
		return Promise.resolve({} as any);
	}

	return fn();
}

export function lazyImportOnlyDesktopApp<T>(fn: () => Promise<T>): () => Promise<T> {
	return () => importOnlyDesktopApp(fn);
}

export function importOnlyDesktopApp<T>(fn: () => Promise<T>): Promise<T> {
	if (!GJ_IS_DESKTOP_APP) {
		return Promise.resolve({} as any);
	}

	return fn();
}
