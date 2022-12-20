export class ContentRules {
	public maxMediaWidth: number | null = null;
	public maxMediaHeight: number | null = null;
	public truncateLinks = false;
	public inlineParagraphs = false;

	constructor(data?: Partial<ContentRules>) {
		Object.assign(this, data);
	}
}
