<script lang="ts" setup>
import AppAspectRatio from '~common/aspect-ratio/AppAspectRatio.vue';
import AppSpacer from '~common/spacer/AppSpacer.vue';
import AppStickerImg from '~common/sticker/AppStickerImg.vue';
import AppStickerMastery from '~common/sticker/AppStickerMastery.vue';
import { StickerModel } from '~common/sticker/sticker.model';
import { vAppTooltip } from '~common/tooltip/tooltip-directive';

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
