import { MarkSpec } from 'prosemirror-model';

export const strike = {
	parseDOM: [{ tag: 's' }, { tag: 'del' }, { tag: 'strike' }],
	toDOM() {
		return ['s', 0];
	},
} as MarkSpec;
