<script lang="ts" setup>
import { computed } from 'vue';

import {
	EmojiGroupModel,
	EmojiGroupTypeCollection,
	EmojiGroupTypeLegacy,
	EmojiGroupTypeUnicode,
} from '~common/emoji/emoji-group.model';
import AppImgResponsive from '~common/img/AppImgResponsive.vue';
import AppJolticon, { Jolticon } from '~common/jolticon/AppJolticon.vue';
import AppMediaItemBackdrop from '~common/media-item/backdrop/AppMediaItemBackdrop.vue';
import { styleFlexCenter } from '~styles/mixins';

type Props = {
	group: EmojiGroupModel;
	/**
	 * Pixel size of the thumbnail.
	 */
	size: number;
};
const { group, size } = defineProps<Props>();

const mediaItem = computed(() => group.media_item);

const icon = computed(() => {
	let result: Jolticon = 'other-os';

	switch (group.type) {
		case EmojiGroupTypeLegacy:
			result = 'bolt-filled';
			break;

		case EmojiGroupTypeUnicode: {
			const name = group.name.toLowerCase();

			if (name === 'smileys & people' || name === 'smileys & emotion') {
				result = 'smiley';
			} else if (name === 'animals & nature') {
				result = 'leaf';
			} else if (name === 'food & drink') {
				result = 'burger';
			} else if (name === 'travel & places') {
				result = 'aircraft';
			} else if (name === 'activities') {
				result = 'jigsaw';
			} else if (name === 'objects') {
				result = 'light-bulb';
			} else if (name === 'symbols') {
				result = 'heart-filled';
			} else if (name === 'flags') {
				result = 'flags';
			}
			break;
		}

		case EmojiGroupTypeCollection:
			result = 'smiley';
			break;

		default:
			if (group.isRecentlyUsed) {
				result = 'clock';
			}
			break;
	}

	return result;
});
</script>

<template>
	<!-- AppEmojiSelectorGroupThumbnail -->
	<div
		:style="{
			width: `${size}px`,
			height: `${size}px`,
		}"
	>
		<template v-if="mediaItem">
			<AppMediaItemBackdrop
				:style="{
					...styleFlexCenter(),
					width: `100%`,
					height: `100%`,
				}"
				:media-item="mediaItem"
			>
				<AppImgResponsive :src="mediaItem.mediaserver_url" />
			</AppMediaItemBackdrop>
		</template>
		<template v-else>
			<AppJolticon
				:style="{
					fontSize: `${size}px`,
					margin: 0,
					lineHeight: 0,
				}"
				:icon="icon"
			/>
		</template>
	</div>
</template>
