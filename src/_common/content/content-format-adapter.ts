import { ContentContext } from '~common/content/content-context';
import { ContentDocument } from '~common/content/content-document';
import { ContentObject } from '~common/content/content-object';
import { ContentWriter } from '~common/content/content-writer';

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
		const outDoc = new ContentDocument(
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
