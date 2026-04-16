<script lang="ts" setup>
import AppStickerLayerDrawerItem from '../../../../../_common/sticker/layer/AppStickerLayerDrawerItem.vue';
import { StickerModel } from '../../../../../_common/sticker/sticker.model';
import AppStickerCollectibleWrapper from '../../../sticker/AppStickerCollectibleWrapper.vue';

type Props = {
	sticker: StickerModel;
	count?: number;
};
const { sticker, count } = defineProps<Props>();
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
