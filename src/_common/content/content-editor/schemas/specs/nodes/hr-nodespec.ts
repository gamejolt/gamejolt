import { NodeSpec } from 'prosemirror-model';

export const hr = {
	group: 'block',
	selectable: false,
	parseDOM: [{ tag: 'hr' }],
	marks: '',
	toDOM() {
		return ['hr'];
	},
} as NodeSpec;
