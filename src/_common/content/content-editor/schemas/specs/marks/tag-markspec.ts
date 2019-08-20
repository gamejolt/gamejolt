import { Mark, MarkSpec } from 'prosemirror-model';

export const tag = {
	attrs: {
		tag: {},
	},
	inclusive: false,
	toDOM(mark: Mark, _inline: boolean) {
		const tagText = mark.attrs.tag;
		return [
			'span',
			{
				class: 'content-editor-tag',
				'data-tag': tagText,
			},
			0,
		];
	},
	parseDOM: [
		{
			tag: 'span[data-tag]',
			getAttrs(domNode: Element) {
				return {
					tag: domNode.getAttribute('data-tag'),
				};
			},
		},
	],
} as MarkSpec;
