import { Node, NodeSpec } from 'prosemirror-model';

export const heading = {
	attrs: { level: { default: 1 } },
	group: 'block',
	content: 'paragraph+',
	defining: true,
	marks: '',

	toDOM: (node: Node) => ['h' + (node.attrs.level + 2), {}, 0],
	parseDOM: [{ tag: 'h3', attrs: { level: 1 } }, { tag: 'h4', attrs: { level: 2 } }],
} as NodeSpec;
