import { ContentDocument } from '../../content/content-document';

export function FormValidatorMaxContentLength(json: string, args: [number]) {
	const doc = ContentDocument.fromJson(json);
	return doc.getLength() <= args[0];
}
