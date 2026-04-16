<script lang="ts" setup>
import AppAspectRatio from '../../aspect-ratio/AppAspectRatio.vue';
import AppSpacer from '../../spacer/AppSpacer.vue';
import { vAppTooltip } from '../../tooltip/tooltip-directive';
import AppStickerImg from '../AppStickerImg.vue';
import AppStickerMastery from '../AppStickerMastery.vue';
import { StickerModel } from '../sticker.model';

type Props = {
	stickers: StickerModel[];
	minWidth?: number;
};
const { stickers, minWidth = 56 } = defineProps<Props>();
</script>

<template>
	<div
		:style="{
			display: `grid`,
			gap: `8px`,
			gridTemplateColumns: `repeat(auto-fill, minmax(${minWidth}px, 1fr))`,
		}"
	>
		<div v-for="sticker of stickers" :key="sticker.id">
			<AppAspectRatio v-app-tooltip="sticker.name" :ratio="1">
				<AppStickerImg
					:src="sticker.img_url"
					:style="{
						width: `100%`,
						height: `100%`,
					}"
				/>
			</AppAspectRatio>

			<template v-if="typeof sticker.mastery === 'number'">
				<AppSpacer vertical :scale="1" />
				<AppStickerMastery :progress="sticker.mastery" />
			</template>
		</div>
	</div>
</template>
