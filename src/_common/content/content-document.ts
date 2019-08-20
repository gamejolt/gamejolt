import { ContentContext } from './content-context';
import { ContentHydrationDataEntry } from './content-hydrator';
import { ContentNode } from './content-node';
import { ContentObject } from './content-object';

const GJ_FORMAT_VERSION = '1.0.0';

export class ContentDocument extends ContentNode {
	public version: string;
	public createdOn: number;
	public context: ContentContext;
	public hydration: ContentHydrationDataEntry[];

	constructor(context: ContentContext, content: ContentObject[] = []) {
		super(content);

		this.version = GJ_FORMAT_VERSION;
		this.createdOn = Date.now();
		this.context = context;
		this.hydration = [];
	}

	public static fromJson(json: string): ContentDocument {
		if (!json) {
			throw new Error('Empty json provided.');
		}

		const jsonObj = JSON.parse(json);

		const context = jsonObj.context;
		const content = [];
		if (Array.isArray(jsonObj.content)) {
			for (const subJsonObj of jsonObj.content) {
				content.push(ContentObject.fromJsonObj(subJsonObj));
			}
		}

		const doc = new ContentDocument(context, content);

		doc.version = jsonObj.version;
		doc.createdOn = jsonObj.createdOn;

		if (Array.isArray(jsonObj.hydration)) {
			doc.hydration = jsonObj.hydration;
		} else {
			doc.hydration = [];
		}

		return doc;
	}

	public toJson() {
		const data = {
			version: this.version,
			createdOn: this.createdOn,
			context: this.context,
			content: this.content.map(i => i.toJsonObj()),
			hydration: [] as ContentHydrationDataEntry[],
		};

		return JSON.stringify(data);
	}

	/**
	 * Determines whether there is any "content" in this document.
	 * This disregards empty objects like paragraphs with only empty text nodes or list items with empty paragraphs.
	 */
	public get hasContent() {
		for (const child of this.content) {
			if (child.hasContent) {
				return true;
			}
		}
		return false;
	}

	public getLength() {
		// Don't count the first paragraph.
		return super.getLength() - 1;
	}
}
