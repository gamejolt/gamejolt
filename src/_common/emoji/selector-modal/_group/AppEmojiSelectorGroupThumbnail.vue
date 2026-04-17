<script lang="ts" setup>
import { computed } from 'vue';

import { EmojiGroupModel, EmojiGroupType } from '~common/emoji/emoji-group.model';
import AppImgResponsive from '~common/img/AppImgResponsive.vue';
import AppJolticon, { Jolticon } from '~common/jolticon/AppJolticon.vue';
import AppMediaItemBackdrop from '~common/media-item/backdrop/AppMediaItemBackdrop.vue';

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
		case EmojiGroupType.Legacy:
			result = 'bolt-filled';
			break;

		case EmojiGroupType.Unicode: {
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

		case EmojiGroupType.Collection:
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
				class="flex h-full w-full items-center justify-center"
				:media-item="mediaItem"
			>
				<AppImgResponsive :src="mediaItem.mediaserver_url" />
			</AppMediaItemBackdrop>
		</template>
		<template v-else>
			<AppJolticon
				class="m-0 leading-none"
				:style="{
					fontSize: `${size}px`,
				}"
				:icon="icon"
			/>
		</template>
	</div>
</template>
