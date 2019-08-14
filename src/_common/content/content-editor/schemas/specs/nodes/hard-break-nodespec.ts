import { NodeSpec } from 'prosemirror-model';

export const hardBreak = {
	inline: true,
	group: 'inline',
	selectable: false,
	parseDOM: [{ tag: 'br' }],
	marks: '',
	toDOM() {
		return ['br'];
	},
} as NodeSpec;
