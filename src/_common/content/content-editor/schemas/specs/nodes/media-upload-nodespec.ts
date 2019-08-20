import { Node, NodeSpec } from 'prosemirror-model';

// When an image gets pasted into the editor, this node handles the upload to a Media Item
// It will be replaced with a mediaItem node after the upload is complete
export const mediaUpload = {
	group: 'block',
	attrs: {
		uploadId: {},
	},
	toDOM: (node: Node) => ['div', { uploadId: node.attrs.uploadId }],
} as NodeSpec;
