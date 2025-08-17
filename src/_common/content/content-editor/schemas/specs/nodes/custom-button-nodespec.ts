import { Node, NodeSpec } from 'prosemirror-model';

export const customButton = {
	group: 'block',
	marks: '',
	draggable: true,
	selectable: true,
	attrs: {
		id: {
			default: '',
		},
	},
	toDOM: (node: Node) => [
		'div',
		{
			'custom-button-id': node.attrs.id,
		},
	],
	parseDOM: [
		{
			tag: 'div[custom-button-id]',
			getAttrs: (domNode: Element) => {
				return {
					id: parseInt(domNode.getAttribute('custom-button-id')!, 10),
				};
			},
		},
	],
} as NodeSpec;
