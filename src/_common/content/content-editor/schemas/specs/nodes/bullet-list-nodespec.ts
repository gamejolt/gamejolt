import { Node, NodeSpec } from 'prosemirror-model';

export const bulletList = {
	group: 'block',
	content: 'listItem+',
	toDOM: (_: Node) => ['ul', 0],
	parseDOM: [{ tag: 'ul' }],
} as NodeSpec;
