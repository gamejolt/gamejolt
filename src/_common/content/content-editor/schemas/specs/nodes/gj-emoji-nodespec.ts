import { Node, NodeSpec } from 'prosemirror-model';

const assetPaths = import.meta.glob('../../../../../emoji/*.png', {
	as: 'url',
	eager: true,
});

export const gjEmoji = {
	attrs: { type: { default: 'grin' }, src: { default: null } },
	group: 'inline',
	inline: true,
	draggable: true,
	selectable: true,
	marks: '',

	// The emoji is rendered as an img to make it selectable without content.
	toDOM: (node: Node) => {
		const useNetworkAsset = !!node.attrs.src;
		return [
			'img',
			{
				'emoji-type': node.attrs.type,
				'emoji-src': node.attrs.src,
				// TODO(reactions) better sizing.
				class: 'emoji' + (useNetworkAsset ? ' emoji-box' : ''),
				title: useNetworkAsset ? node.attrs.type : ':' + node.attrs.type + ':',
				src: useNetworkAsset
					? node.attrs.src
					: assetPaths[`../../../../../emoji/${node.attrs.type}.png`],
			},
		];
	},
	parseDOM: [
		{
			tag: 'img[emoji-type]',
			getAttrs: (domNode: Element) => {
				const type = domNode.getAttribute('emoji-type');
				// TODO(reactions) I don't know
				const src = domNode.getAttribute('emoji-src');
				return { type, src };
			},
		},
	],
} as NodeSpec;
