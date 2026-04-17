<script lang="ts" setup>
import AppStickerCollectibleWrapper from '~app/components/sticker/AppStickerCollectibleWrapper.vue';
import AppStickerLayerDrawerItem from '~common/sticker/layer/AppStickerLayerDrawerItem.vue';
import { StickerModel } from '~common/sticker/sticker.model';

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
