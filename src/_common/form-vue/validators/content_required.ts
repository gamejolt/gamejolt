import { ContentDocument } from '../../content/content-document';

export function FormValidatorContentRequired(json: string) {
	const doc = ContentDocument.fromJson(json);
	return doc.hasContent;
}
