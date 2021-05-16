export class ContentRules {
	public maxMediaWidth: number | null = null;
	public maxMediaHeight: number | null = null;
	/** Truncates links to a max length. */
	public truncateLinks = false;
	/** Embiggens emojis when the entire content is just 1 emoji. */
	public biggifyEmojis = false;

	constructor(data?: Partial<ContentRules>) {
		Object.assign(this, data);
	}
}
