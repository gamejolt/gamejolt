import { Node, NodeSpec } from 'prosemirror-model';

const assetPaths = import.meta.globEager('../../../../../emoji/*.png');

export const gjEmoji = {
	attrs: { type: { default: 'grin' } },
	group: 'inline',
	inline: true,
	draggable: true,
	selectable: true,
	marks: '',

	// The emoji is rendered as an img to make it selectable without content.
	toDOM: (node: Node) => [
		'img',
		{
			'emoji-type': node.attrs.type,
			class: 'emoji',
			title: ':' + node.attrs.type + ':',
			src: assetPaths[`../../../../../emoji/${node.attrs.type}.png`].default,
		},
	],

	parseDOM: [
		{
			tag: 'img[emoji-type]',
			getAttrs: (domNode: Element) => {
				const type = domNode.getAttribute('emoji-type');
				return { type };
			},
		},
	],
} as NodeSpec;
