import { Mark, MarkSpec } from 'prosemirror-model';

export const community = {
	attrs: {
		community: {},
	},
	inclusive: false,
	toDOM(mark: Mark, _inline: boolean) {
		const communityPath = mark.attrs.community;
		return [
			'span',
			{
				class: 'content-editor-community',
				'data-community': communityPath,
			},
			0,
		];
	},
	parseDOM: [
		{
			tag: 'span[data-community]',
			getAttrs(domNode: Element) {
				return {
					community: domNode.getAttribute('data-community'),
				};
			},
		},
	],
} as MarkSpec;
