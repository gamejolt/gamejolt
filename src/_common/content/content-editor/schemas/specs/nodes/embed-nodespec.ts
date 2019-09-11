import { Node, NodeSpec } from 'prosemirror-model';

export const embed = {
	group: 'block',
	marks: '',
	draggable: false,
	selectable: true,
	attrs: {
		type: {
			default: '',
		},
		source: {
			default: '',
		},
	},
	toDOM: (node: Node) => [
		'div',
		{
			'embed-type': node.attrs.type,
			'embed-source': node.attrs.source,
		},
	],
	parseDOM: [
		{
			tag: 'div[embed-type]',
			getAttrs: (domNode: Element) => {
				return {
					type: domNode.getAttribute('embed-type'),
					source: domNode.getAttribute('embed-source'),
				};
			},
		},
	],
} as NodeSpec;
