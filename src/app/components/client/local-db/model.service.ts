export interface LocalDbModel<T> {
	// hydrate(): void;
	set(data: Partial<T>): void;
}
