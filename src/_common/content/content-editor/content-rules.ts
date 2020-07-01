export class ContentRules {
	public maxMediaWidth: number | null = null;
	public maxMediaHeight: number | null = null;

	constructor(data?: Partial<ContentRules>) {
		Object.assign(this, data);
	}
}
