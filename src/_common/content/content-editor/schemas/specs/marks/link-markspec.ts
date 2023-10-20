import { DOMOutputSpec, Fragment, Mark, MarkSpec } from 'prosemirror-model';
import { ContentEditorSchema } from '../../content-editor-schema';

const linkAttrs = {
	href: {},
	title: { default: null },
	autolink: { default: false },
};

const getAttrsContentEditorLink = (domNode: Element) => ({
	href: domNode.getAttribute('data-href'),
	title: domNode.getAttribute('data-title'),
	autolink: domNode.getAttribute('data-autolink'),
});

const toDOM = (mark: Mark, _inline: boolean): DOMOutputSpec => {
	const { href, title, autolink } = mark.attrs;
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
};

/**
 * The basic link element. Used for autolinks. Does not support parsing custom links.
 */
export const link = {
	attrs: linkAttrs,
	inclusive: false,
	toDOM,
	parseDOM: [
		// Parse pasted content editor link text.
		{
			tag: 'span[data-href]',
			getAttrs: getAttrsContentEditorLink,
		},
		// Parse pasted HTML anchor tag.
		{
			tag: 'a',
			getAttrs(domNode: Element) {
				const href = domNode.getAttribute('href') ?? '';
				// Only autolinks are allowed, so we force it to be one (same title & content as href)
				const title = href;
				const isAutolink = true;

				return {
					href,
					title,
					autolink: isAutolink,
				};
			},
			// Make sure the content of the node is the href, since this is an autolink.
			// Replaces whatever was between the <a>...</a> tags.
			getContent(node: Node, schema: ContentEditorSchema) {
				const el = node as Element;
				const href = el.getAttribute('href');
				if (href) {
					return Fragment.from(schema.text(href));
				}

				return Fragment.empty;
			},
		},
	],
} as MarkSpec;

/**
 * Custom link mark spec, that also supports parsing and inserting any custom link.
 */
export const customLink = {
	attrs: linkAttrs,
	inclusive: false,
	toDOM,
	parseDOM: [
		// Parse pasted content editor link text.
		{
			tag: 'span[data-href]',
			getAttrs: getAttrsContentEditorLink,
		},
		// Parse pasted HTML anchor tag.
		{
			tag: 'a',
			getAttrs(domNode: Element) {
				const href = domNode.getAttribute('href') ?? '';
				const title = (domNode.textContent || domNode.getAttribute('title') || href).trim();
				const isAutolink = title === href;

				return {
					href,
					title,
					autolink: isAutolink,
				};
			},
		},
	],
} as MarkSpec;
