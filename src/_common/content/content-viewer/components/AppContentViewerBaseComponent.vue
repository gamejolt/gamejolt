<script lang="ts">
import { computed, h, PropType, toRefs } from 'vue';
import { ContentObject } from '../../content-object';
import { ContentRules } from '../../content-rules';
import AppContentViewerBlockquote from './AppContentViewerBlockquote.vue';
import AppContentViewerChatInvite from './AppContentViewerChatInvite.vue';
import AppContentViewerCodeBlock from './AppContentViewerCodeBlock.vue';
import AppContentViewerCustomButton from './AppContentViewerCustomButton.vue';
import AppContentViewerEmbed from './AppContentViewerEmbed.vue';
import AppContentViewerGif from './AppContentViewerGif.vue';
import AppContentViewerGJEmoji from './AppContentViewerGJEmoji.vue';
import AppContentViewerHardBreak from './AppContentViewerHardBreak.vue';
import AppContentViewerHeading from './AppContentViewerHeading.vue';
import AppContentViewerHorizontalRule from './AppContentViewerHorizontalRule.vue';
import AppContentViewerList from './AppContentViewerList.vue';
import AppContentViewerListItem from './AppContentViewerListItem.vue';
import AppContentViewerMediaItem from './AppContentViewerMediaItem.vue';
import AppContentViewerParagraph from './AppContentViewerParagraph.vue';
import AppContentViewerSpoiler from './AppContentViewerSpoiler.vue';
import AppContentViewerSticker from './AppContentViewerSticker.vue';
import AppContentViewerText from './AppContentViewerText.vue';

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
		case 'customButton':
			return AppContentViewerCustomButton;
	}
}

export function renderContentChildren(
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

const children = computed(() => renderContentChildren(content.value, contentRules.value));
</script>

<template>
	<div>
		<template v-for="child in children" :key="child">
			<component :is="child" />
		</template>
	</div>
</template>
