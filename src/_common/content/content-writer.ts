import { ContentDocument } from './content-document';
import { ContentObject } from './content-object';
import { MarkObject } from './mark-object';

export class ContentWriter {
	private _doc: ContentDocument;

	constructor(doc: ContentDocument) {
		this._doc = doc;
	}

	public ensureParagraph(): ContentObject {
		let p: ContentObject;

		if (
			this._doc.lastChild === null ||
			(this._doc.lastChild instanceof ContentObject &&
				this._doc.lastChild.type !== 'paragraph')
		) {
			p = new ContentObject('paragraph');
			this._doc.appendChild(p);
		} else {
			p = this._doc.lastChild!;
		}

		return p;
	}

	public appendTag(tag: string) {
		const tagObj = new ContentObject('text');
		tagObj.text = '#' + tag;
		const tagMark = new MarkObject('tag');
		tagMark.attrs.tag = tag;
		tagObj.marks.push(tagMark);

		const parentParagraph = this.ensureParagraph();
		if (parentParagraph.lastChild instanceof ContentObject) {
			if (parentParagraph.lastChild.type === 'text') {
				parentParagraph.lastChild.text += ' ';
			} else {
				const t = new ContentObject('text');
				t.text = ' ';
				parentParagraph.appendChild(t);
			}
		}

		parentParagraph.appendChild(tagObj);
	}
}
