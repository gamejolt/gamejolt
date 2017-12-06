export abstract class LocalDbModel<T = any> {
	abstract hydrate(): void;
	abstract set(data: Partial<T>): void;
}
