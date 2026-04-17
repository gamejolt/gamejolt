<script lang="ts">
import { computed, h } from 'vue';

import { ContentObject } from '~common/content/content-object';
import { ContentRules } from '~common/content/content-rules';
import AppContentViewerBlockquote from '~common/content/content-viewer/components/AppContentViewerBlockquote.vue';
import AppContentViewerChatInvite from '~common/content/content-viewer/components/AppContentViewerChatInvite.vue';
import AppContentViewerCodeBlock from '~common/content/content-viewer/components/AppContentViewerCodeBlock.vue';
import AppContentViewerCustomButton from '~common/content/content-viewer/components/AppContentViewerCustomButton.vue';
import AppContentViewerEmbed from '~common/content/content-viewer/components/AppContentViewerEmbed.vue';
import AppContentViewerGif from '~common/content/content-viewer/components/AppContentViewerGif.vue';
import AppContentViewerGJEmoji from '~common/content/content-viewer/components/AppContentViewerGJEmoji.vue';
import AppContentViewerHardBreak from '~common/content/content-viewer/components/AppContentViewerHardBreak.vue';
import AppContentViewerHeading from '~common/content/content-viewer/components/AppContentViewerHeading.vue';
import AppContentViewerHorizontalRule from '~common/content/content-viewer/components/AppContentViewerHorizontalRule.vue';
import AppContentViewerList from '~common/content/content-viewer/components/AppContentViewerList.vue';
import AppContentViewerListItem from '~common/content/content-viewer/components/AppContentViewerListItem.vue';
import AppContentViewerMediaItem from '~common/content/content-viewer/components/AppContentViewerMediaItem.vue';
import AppContentViewerParagraph from '~common/content/content-viewer/components/AppContentViewerParagraph.vue';
import AppContentViewerSpoiler from '~common/content/content-viewer/components/AppContentViewerSpoiler.vue';
import AppContentViewerSticker from '~common/content/content-viewer/components/AppContentViewerSticker.vue';
import AppContentViewerText from '~common/content/content-viewer/components/AppContentViewerText.vue';

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
type Props = {
	content: ContentObject[];
	contentRules: ContentRules;
};
const { content, contentRules } = defineProps<Props>();

const children = computed(() => renderContentChildren(content, contentRules));
</script>

<template>
	<div>
		<template v-for="child in children" :key="child">
			<component :is="child" />
		</template>
	</div>
</template>
