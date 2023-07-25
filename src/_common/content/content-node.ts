import { ContentObject, ContentObjectType } from './content-object';
import { MarkObject, MarkObjectType } from './mark-object';

export abstract class ContentNode {
	protected _content: ContentObject[];

	get content(): readonly ContentObject[] {
		return this._content;
	}

	get hasChildren() {
		return this.content.length > 0;
	}

	get lastChild(): ContentObject | null {
		if (!this.hasChildren) {
			return null;
		}
		return this.content[this.content.length - 1];
	}

	get firstChild(): ContentObject | null {
		if (!this.hasChildren) {
			return null;
		}
		return this.content[0];
	}

	constructor(content: ContentObject[] = []) {
		this._content = content;
	}

	public getChildrenByType(type: ContentObjectType): ContentObject[] {
		const objs = [] as ContentObject[];
		for (const contentObj of this.content) {
			if (contentObj.type === type) {
				objs.push(contentObj);
			}
			const subObjs = contentObj.getChildrenByType(type);
			objs.push(...subObjs);
		}
		return objs;
	}

	public getMarks(type: MarkObjectType): MarkObject[] {
		const textObjs = this.getChildrenByType('text');
		const marks = [] as MarkObject[];

		for (const textObj of textObjs) {
			marks.push(...textObj.marks.filter(m => m.type === type));
		}

		return marks;
	}

	public appendChild(child: ContentObject) {
		this._content.push(child);
	}

	/**
	 * Returns a uniform length computed by the children and their content.
	 * Each node type can define its own way to compute its length.
	 */
	public getLength() {
		let length = 0;

		for (const contentObj of this._content) {
			length += contentObj.getLength();
		}

		return length;
	}
}
