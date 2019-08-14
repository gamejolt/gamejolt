import { ContentDocument } from './content-document';
import { ContentContext } from './content-context';
import { ContentObject } from './content-object';
import { ContentWriter } from './content-writer';

export type ProsemirrorEditorFormat = {
	type: 'doc';
	content: ContentObject[];
};

/**
 * Adapts the GJ Content Format to the format the prosemirror content editor needs
 */
export class ContentFormatAdapter {
	/**
	 * Converts from the GJ Content Format to the editor format
	 */
	public static adaptIn(inDoc: ContentDocument) {
		// Make sure there is at least one child.
		if (!inDoc.hasChildren) {
			const p = new ContentObject('paragraph');
			inDoc.appendChild(p);
		}

		const outObj = {
			type: 'doc',
			content: inDoc.content,
		} as ProsemirrorEditorFormat;

		return outObj;
	}

	/**
	 * Converts from the editor format to the GJ Content format
	 */
	public static adaptOut(inObj: ProsemirrorEditorFormat, context: ContentContext) {
		let outDoc = new ContentDocument(
			context,
			inObj.content.map(i => ContentObject.fromJsonObj(i))
		);

		// Make sure we always have at least one paragraph node
		if (!outDoc.hasChildren) {
			const writer = new ContentWriter(outDoc);
			writer.ensureParagraph();
		}

		return outDoc;
	}
}
