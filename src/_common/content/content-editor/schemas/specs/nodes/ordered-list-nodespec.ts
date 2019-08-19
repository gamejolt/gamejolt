import { Node, NodeSpec } from 'prosemirror-model';

export const orderedList = {
	group: 'block',
	content: 'listItem+',
	toDOM: (_: Node) => ['ol', 0],
	parseDOM: [{ tag: 'ol' }],
} as NodeSpec;
