<script lang="ts" setup>
import { PropType } from 'vue';
import AppStickerCollectibleWrapper from '../../../../../_common/sticker/AppStickerCollectibleWrapper.vue';
import AppStickerLayerDrawerItem from '../../../../../_common/sticker/layer/AppStickerLayerDrawerItem.vue';
import { StickerModel } from '../../../../../_common/sticker/sticker.model';

defineProps({
	sticker: {
		type: Object as PropType<StickerModel>,
		required: true,
	},
	count: {
		type: Number,
		default: undefined,
	},
});
</script>

<template>
	<AppStickerCollectibleWrapper :data="sticker" show-tooltip>
		<AppStickerLayerDrawerItem
			:sticker="sticker"
			:count="count"
			fit-parent
			no-drag
			show-mastery
		/>
	</AppStickerCollectibleWrapper>
</template>
