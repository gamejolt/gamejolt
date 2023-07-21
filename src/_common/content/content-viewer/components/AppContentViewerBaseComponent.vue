<script lang="ts">
import { computed, h, PropType, toRefs } from 'vue';
import { ContentRules } from '../../content-rules';
import { ContentObject } from '../../content-object';
import AppContentViewerHardBreak from './AppContentViewerHardBreak.vue';
import AppContentViewerParagraph from './AppContentViewerParagraph.vue';
import { AppContentViewerBlockquote } from './blockquote';
import { AppContentViewerChatInvite } from './chat-invite';
import { AppContentViewerCodeBlock } from './code/code';
import { AppContentViewerEmbed } from './embed';
import { AppContentViewerGif } from './gif';
import { AppContentViewerGJEmoji } from './gjEmoji';
import { AppContentViewerHeading } from './heading';
import { AppContentViewerHorizontalRule } from './hr';
import { AppContentViewerList } from './list';
import { AppContentViewerListItem } from './list-item';
import { AppContentViewerMediaItem } from './media-item';
import { AppContentViewerSpoiler } from './spoiler';
import { AppContentViewerSticker } from './sticker';
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
		case 'sticker':
			return AppContentViewerSticker;
		case 'chatInvite':
			return AppContentViewerChatInvite;
	}
}

export function renderChildren(
	childObjects: ReadonlyArray<ContentObject>,
	contentRules?: ContentRules
) {
	const children = [];
	if (childObjects) {
		let prevWasParagraph = false;
		const inlineParagraphs = contentRules?.inlineParagraphs === true;

		for (const contentData of childObjects) {
			const currentIsParagraph = contentData.type === 'paragraph';

			// Add a space of padding around each paragraph we're trying to
			// render inline.
			if (inlineParagraphs && (prevWasParagraph || currentIsParagraph)) {
				children.push(h('span', {}, ' '));
			}

			const childVNode = h(getComponentType(contentData), { contentData });
			children.push(childVNode);
			prevWasParagraph = currentIsParagraph;
		}
	}
	return children;
}
</script>

<script lang="ts" setup>
const props = defineProps({
	content: {
		type: Array as PropType<ContentObject[]>,
		required: true,
	},
	contentRules: {
		type: Object as PropType<ContentRules>,
		required: true,
	},
});

const { content, contentRules } = toRefs(props);

const children = computed(() => renderChildren(content.value, contentRules.value));
</script>

<template>
	<div>
		<template v-for="child in children" :key="child">
			<component :is="child" />
		</template>
	</div>
</template>
