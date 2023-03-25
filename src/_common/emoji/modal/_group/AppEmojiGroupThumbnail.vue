<script lang="ts" setup>
import { computed, PropType, toRefs } from 'vue';
import { styleFlexCenter } from '../../../../_styles/mixins';
import AppImgResponsive from '../../../img/AppImgResponsive.vue';
import AppJolticon, { Jolticon } from '../../../jolticon/AppJolticon.vue';
import AppMediaItemBackdrop from '../../../media-item/backdrop/AppMediaItemBackdrop.vue';
import { EmojiGroup } from '../../emoji-group.model';

const props = defineProps({
	group: {
		type: Object as PropType<EmojiGroup>,
		required: true,
	},
	/**
	 * Pixel size of the thumbnail.
	 */
	size: {
		type: Number,
		validator: val => typeof val === 'number' && val > 0,
		required: true,
	},
});

const { group } = toRefs(props);

const mediaItem = computed(() => group.value.media_item);

const icon = computed(() => {
	let result: Jolticon = 'other-os';

	switch (group.value.type) {
		case EmojiGroup.TYPE_LEGACY:
			result = 'bolt-filled';
			break;

		case EmojiGroup.TYPE_UNICODE: {
			const name = group.value.name.toLowerCase();

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

		case EmojiGroup.TYPE_COLLECTION:
			result = 'smiley';
			break;

		default:
			if (group.value.isRecentlyUsed) {
				result = 'clock';
			}
			break;
	}

	return result;
});
</script>

<template>
	<!-- AppEmojiGroupThumbnail -->
	<div
		:style="{
			width: `${size}px`,
			height: `${size}px`,
		}"
	>
		<template v-if="mediaItem">
			<!-- TODO(reactions) test this. -->
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
