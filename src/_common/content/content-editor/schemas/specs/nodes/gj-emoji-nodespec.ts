import { Node, NodeSpec } from 'prosemirror-model';

export const gjEmoji = {
	attrs: {
		id: {
			default: 0,
		},
	},
	group: 'inline',
	inline: true,
	draggable: true,
	selectable: true,
	marks: '',

	// The emoji is rendered as an img to make it selectable without content.
	toDOM: (node: Node) => {
		const { id } = node.attrs;

		return [
			'span',
			{
				'emoji-id': id,
			},
		];
	},
	parseDOM: [
		{
			tag: 'span[emoji-id]',
			getAttrs: (domNode: Element) => {
				const id = parseInt(domNode.getAttribute('emoji-id')!, 10);
				return { id };
			},
		},
	],
} as NodeSpec;
