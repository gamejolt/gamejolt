import { Node, NodeSpec } from 'prosemirror-model';

export const gjEmoji = {
	attrs: {
		id: {
			default: undefined,
		},
		type: {
			default: undefined,
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
			tag: 'img[emoji-id]',
			getAttrs: (domNode: Element) => {
				const result: Record<string, any> = {};
				const id = parseInt(domNode.getAttribute('emoji-id') || '0', 10);
				const type = domNode.getAttribute('emoji-type');

				if (id) {
					result.id = id;
				}
				if (type) {
					result.type = type;
				}
				return result;
			},
		},
	],
} as NodeSpec;
