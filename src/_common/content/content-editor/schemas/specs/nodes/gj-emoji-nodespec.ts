import { Node, NodeSpec } from 'prosemirror-model';

export const gjEmoji = {
	attrs: { type: { default: 'grin' } },
	group: 'inline',
	inline: true,
	draggable: true,
	selectable: true,
	marks: '',

	toDOM: (node: Node) => [
		'span',
		{
			'emoji-type': node.attrs.type,
		},
	],

	parseDOM: [
		{
			tag: 'span[emoji-type]',
			getAttrs: (domNode: Element) => {
				const type = domNode.getAttribute('emoji-type');
				return { type };
			},
		},
	],
} as NodeSpec;
