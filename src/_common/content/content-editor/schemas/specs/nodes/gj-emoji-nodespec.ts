import { Node, NodeSpec } from 'prosemirror-model';

export const gjEmoji = {
	attrs: {
		id: {
			default: 0,
		},
		type: {
			default: '',
		},
	},
	group: 'inline',
	inline: true,
	draggable: true,
	selectable: true,
	marks: '',

	// The emoji is rendered as an img to make it selectable without content.
	toDOM: (node: Node) => {
		const { id, type } = node.attrs;

		return [
			'img',
			{
				'emoji-id': id,
				'emoji-type': type,
			},
		];
	},
	parseDOM: [
		{
			// TODO(reactions) id may default to 0. is this correct?
			tag: 'img[emoji-id]',
			getAttrs: (domNode: Element) => {
				const id = parseInt(domNode.getAttribute('emoji-id') || '0', 10);
				const type = domNode.getAttribute('emoji-type');
				return { id, type };
			},
		},
	],
} as NodeSpec;
