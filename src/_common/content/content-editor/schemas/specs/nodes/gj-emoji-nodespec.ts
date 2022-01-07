import { Node, NodeSpec } from 'prosemirror-model';
import { emptyGif } from '../../../../../../utils/image';

export const gjEmoji = {
	attrs: { type: { default: 'grin' } },
	group: 'inline',
	inline: true,
	draggable: true,
	selectable: true,
	marks: '',

	// The emoji is rendered as an img to make it selectable without content.
	// The src is set to a transparent gif to remove weird borders that show up when the img tag is left without src.
	toDOM: (node: Node) => [
		'img',
		{
			'emoji-type': node.attrs.type,
			title: ':' + node.attrs.type + ':',
			src: emptyGif,
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
