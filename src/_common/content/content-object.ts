import { LINK_LENGTH } from './content-editor/schemas/specs/marks/link-markspec';
import { ContentNode } from './content-node';
import { MarkObject } from './mark-object';

export type ContentObjectType =
	| 'text'
	| 'paragraph'
	| 'table'
	| 'tableRow'
	| 'tableCell'
	| 'hr'
	| 'codeBlock'
	| 'gjEmoji'
	| 'blockquote'
	| 'hardBreak'
	| 'embed'
	| 'mediaItem'
	| 'orderedList'
	| 'bulletList'
	| 'listItem'
	| 'spoiler'
	| 'heading'
	| 'gif'
	| 'sticker'
	| 'chatInvite';

export class ContentObject extends ContentNode {
	public type!: ContentObjectType;
	public text!: string | null;
	public attrs!: { [key: string]: any };
	public marks!: MarkObject[];

	constructor(type: ContentObjectType, content: ContentObject[] = []) {
		super(content);

		this.type = type;

		this.text = null;
		this.attrs = {};
		this.marks = [];
	}

	public get hasContent() {
		// hr and hard break do not count as "content".
		switch (this.type) {
			case 'text':
				return typeof this.text === 'string' && this.text.length > 0;
			// The following types are automatically considered content:
			case 'gjEmoji':
			case 'embed':
			case 'mediaItem':
			case 'gif':
			case 'sticker':
				return true;
		}

		for (const child of this.content) {
			if (child.hasContent) {
				return true;
			}
		}

		return false;
	}

	public static fromJsonObj(jsonObj: any): ContentObject {
		const type = jsonObj.type as ContentObjectType;
		const obj = new ContentObject(type);

		if (typeof jsonObj.text === 'string') {
			obj.text = jsonObj.text;
		} else {
			obj.text = null;
		}

		if (jsonObj.attrs === undefined) {
			obj.attrs = {};
		} else {
			obj.attrs = jsonObj.attrs;
		}

		obj._content = [];
		if (Array.isArray(jsonObj.content)) {
			for (const subJsonObj of jsonObj.content) {
				obj.appendChild(ContentObject.fromJsonObj(subJsonObj));
			}
		}

		obj.marks = [];
		if (Array.isArray(jsonObj.marks)) {
			for (const subJsonObj of jsonObj.marks) {
				obj.marks.push(MarkObject.fromJsonObj(subJsonObj));
			}
		}

		return obj;
	}

	public toJsonObj(): any {
		const jsonObj = {} as any;

		jsonObj.type = this.type;

		if (this.attrs !== undefined && Object.keys(this.attrs).length > 0) {
			jsonObj.attrs = this.attrs;
		}

		if (this.text !== null) {
			jsonObj.text = this.text;
		}

		if (this.content.length > 0) {
			jsonObj.content = this.content.map(i => i.toJsonObj());
		}

		if (this.marks.length > 0) {
			jsonObj.marks = this.marks.map(i => i.toJsonObj());
		}

		return jsonObj;
	}

	public getLength() {
		let length = 0;

		switch (this.type) {
			case 'text':
				if (this.marks.some(m => m.type === 'link')) {
					length += LINK_LENGTH;
				} else if (this.text) {
					// Replace surrogate pairs with "_"
					// This will count the code points rather than code units.
					// Based on https://medium.com/@tanishiking/count-the-number-of-unicode-code-points-in-javascript-on-cross-browser-62c32b8d919c
					length += this.text.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '_').length;
				}
				break;
			case 'listItem': // Include a char for the 1./* at the beginning
			case 'gjEmoji':
			case 'hardBreak':
			case 'hr':
			case 'paragraph':
			case 'gif':
			case 'sticker':
			case 'chatInvite':
				length++;
				break;
			case 'embed':
				length += (this.attrs.source as string).length;
				break;
			case 'mediaItem':
				length += (this.attrs.caption as string).length + 1;
				break;
		}

		length += super.getLength();
		return length;
	}
}
