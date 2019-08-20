import { Mark, MarkSpec } from 'prosemirror-model';

export const LINK_LENGTH = 23;

export const link = {
	attrs: {
		href: {},
		title: { default: null },
		autolink: { default: false },
	},
	inclusive: false,
	toDOM(mark: Mark, _inline: boolean) {
		let { href, title, autolink } = mark.attrs;
		return [
			'span',
			{
				class: 'content-editor-link',
				title: href,
				'data-href': href,
				'data-title': title,
				'data-autolink': autolink,
			},
			0,
		];
	},
	parseDOM: [
		{
			tag: 'span[data-href]',
			getAttrs(domNode: Element) {
				return {
					href: domNode.getAttribute('data-href'),
					title: domNode.getAttribute('data-title'),
					autolink: domNode.getAttribute('data-autolink'),
				};
			},
		},
	],
} as MarkSpec;
