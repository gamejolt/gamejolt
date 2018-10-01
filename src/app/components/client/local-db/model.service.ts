export abstract class LocalDbModel<T = any> {
	id = 0;
	abstract hydrate(): void;
	abstract set(data: Partial<T>): void;
}
