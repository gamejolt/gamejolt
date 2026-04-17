<script lang="ts" setup>
import { computed, CSSProperties } from 'vue';

import AppJolticon from '~common/jolticon/AppJolticon.vue';
import AppStickerImg from '~common/sticker/AppStickerImg.vue';
import { StickerModel } from '~common/sticker/sticker.model';
import { kThemeBgOffset, kThemePrimary, kThemePrimaryFg } from '~common/theme/variables';
import { kBorderWidthBase, kStrongEaseOut } from '~styles/variables';

type Props = {
	sticker: StickerModel;
	selected: boolean;
	disabled?: boolean;
};
const { sticker, selected, disabled } = defineProps<Props>();

const emit = defineEmits<{
	click: [event: Event];
}>();

const baseStyles = computed(() => {
	const result: CSSProperties = {
		position: `relative`,
		backgroundColor: kThemeBgOffset,
		border: kBorderWidthBase.px,
		borderStyle: `solid`,
		borderColor: `transparent`,
		padding: `12px`,
		transition: `border-color 300ms ${kStrongEaseOut}`,
	};

	if (selected) {
		result.borderColor = kThemePrimary;
	}

	if (disabled) {
		result.opacity = 0.5;
	} else {
		result.cursor = `pointer`;
	}

	return result;
});

function onClickSticker(event: Event) {
	if (disabled) {
		return;
	}

	emit('click', event);
}
</script>

<template>
	<div class="rounded-lg" :style="baseStyles" @click="onClickSticker">
		<AppStickerImg class="h-full w-full" :src="sticker.img_url" />

		<div
			class="flex items-center justify-center"
			:style="{
				position: `absolute`,
				left: `4px`,
				top: `4px`,
				width: `24px`,
				height: `24px`,
				zIndex: 1,
				pointerEvents: `none`,
				borderRadius: `50%`,
				transition: `opacity 300ms ${kStrongEaseOut}`,
				opacity: selected ? 1 : 0,
				backgroundColor: kThemePrimary,
			}"
		>
			<AppJolticon
				icon="check"
				:style="{
					margin: 0,
					fontSize: `16px`,
					color: kThemePrimaryFg,
				}"
			/>
		</div>
	</div>
</template>
