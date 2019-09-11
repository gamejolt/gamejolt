import Vue, { CreateElement } from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { ContentObject } from '../../content-object';
import { ContentOwner } from '../../content-owner';
import { AppContentViewerBlockquote } from './blockquote';
import { AppContentViewerHardBreak } from './br';
import { AppContentViewerCodeBlock } from './code/code';
import { AppContentViewerEmbed } from './embed';
import { AppContentViewerGif } from './gif';
import { AppContentViewerGJEmoji } from './gjEmoji';
import { AppContentViewerHeading } from './heading';
import { AppContentViewerHorizontalRule } from './hr';
import { AppContentViewerList } from './list';
import { AppContentViewerListItem } from './list-item';
import { AppContentViewerMediaItem } from './media-item';
import { AppContentViewerParagraph } from './paragraph';
import { AppContentViewerSpoiler } from './spoiler';
import { AppContentViewerText } from './text';

function getComponentType(data: ContentObject): any {
	switch (data.type) {
		case 'paragraph':
			return AppContentViewerParagraph;
		case 'text':
			return AppContentViewerText;
		case 'blockquote':
			return AppContentViewerBlockquote;
		case 'codeBlock':
			return AppContentViewerCodeBlock;
		case 'hardBreak':
			return AppContentViewerHardBreak;
		case 'gjEmoji':
			return AppContentViewerGJEmoji;
		case 'embed':
			return AppContentViewerEmbed;
		case 'mediaItem':
			return AppContentViewerMediaItem;
		case 'bulletList':
		case 'orderedList':
			return AppContentViewerList;
		case 'listItem':
			return AppContentViewerListItem;
		case 'hr':
			return AppContentViewerHorizontalRule;
		case 'spoiler':
			return AppContentViewerSpoiler;
		case 'heading':
			return AppContentViewerHeading;
		case 'gif':
			return AppContentViewerGif;
	}
}

export function renderChildren(
	h: CreateElement,
	owner: ContentOwner,
	childObjects: ReadonlyArray<ContentObject>
) {
	const children = [];
	if (childObjects) {
		for (const obj of childObjects) {
			const childVNode = h(getComponentType(obj), { props: { data: obj, owner } });
			children.push(childVNode);
		}
	}
	return children;
}

@Component({})
export class AppContentViewerBaseComponent extends Vue {
	@Prop(Array)
	content!: ContentObject[];
	@Prop(Object)
	owner!: ContentOwner;

	render(h: CreateElement) {
		return h('div', renderChildren(h, this.owner, this.content));
	}
}
