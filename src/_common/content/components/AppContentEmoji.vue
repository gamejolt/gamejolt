<script lang="ts" setup>
import { PropType, ref } from 'vue';
import { isInstance } from '../../../utils/utils';
import AppEmoji, { GJ_EMOJIS, emojiBaseSize } from '../../emoji/AppEmoji.vue';
import { EmojiModel } from '../../emoji/emoji.model';
import { storeModel } from '../../model/model-store.service';
import AppStickerCollectibleWrapper from '../../sticker/AppStickerCollectibleWrapper.vue';
import { useContentOwnerController } from '../content-owner';

const props = defineProps({
	emojiId: {
		type: Number,
		default: undefined,
	},
	emojiType: {
		type: String as PropType<(typeof GJ_EMOJIS)[number]>,
		validator: (val: any) => GJ_EMOJIS.includes(val),
		default: undefined,
	},
	showDetails: {
		type: Boolean,
	},
});

const owner = useContentOwnerController()!;

const emoji = ref<EmojiModel | (typeof GJ_EMOJIS)[number]>();

if (props.emojiId) {
	owner.hydrator.useData('emoji-id', props.emojiId.toString(), data => {
		if (data) {
			emoji.value = storeModel(EmojiModel, data);
		}
	});
} else {
	// eslint-disable-next-line vue/no-setup-props-destructure
	emoji.value = props.emojiType;
}
</script>

<template>
	<template v-if="emoji">
		<AppStickerCollectibleWrapper
			:data="showDetails && isInstance(emoji, EmojiModel) ? emoji : undefined"
			:show-tooltip="showDetails"
		>
			<AppEmoji :emoji="emoji" />
		</AppStickerCollectibleWrapper>
	</template>
	<template v-else>
		<img
			:style="{
				display: `inline-block`,
				width: emojiBaseSize.px,
				height: emojiBaseSize.px,
			}"
			src=""
			:alt="GJ_IS_MOBILE_APP ? undefined : ''"
		/>
	</template>
</template>
