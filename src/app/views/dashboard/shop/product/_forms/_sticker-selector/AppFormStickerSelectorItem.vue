<script lang="ts" setup>
import { CSSProperties, PropType, computed, toRefs } from 'vue';
import AppJolticon from '../../../../../../../_common/jolticon/AppJolticon.vue';
import AppStickerImg from '../../../../../../../_common/sticker/AppStickerImg.vue';
import { StickerModel } from '../../../../../../../_common/sticker/sticker.model';
import {
	kThemeBgOffset,
	kThemePrimary,
	kThemePrimaryFg,
} from '../../../../../../../_common/theme/variables';
import {
	styleBorderRadiusLg,
	styleFlexCenter,
	styleWhen,
} from '../../../../../../../_styles/mixins';
import { kBorderWidthBase, kStrongEaseOut } from '../../../../../../../_styles/variables';

const props = defineProps({
	sticker: {
		type: Object as PropType<StickerModel>,
		required: true,
	},
	selected: {
		type: Boolean,
		required: true,
	},
	disabled: {
		type: Boolean,
	},
	onClick: {
		type: Function,
		required: true,
	},
});

const { sticker, selected, disabled } = toRefs(props);

const emit = defineEmits({
	click: (_event: Event) => true,
});

const baseStyles = computed(() => {
	const result: CSSProperties = {
		...styleBorderRadiusLg,
		position: `relative`,
		backgroundColor: kThemeBgOffset,
		border: kBorderWidthBase.px,
		borderStyle: `solid`,
		borderColor: `transparent`,
		padding: `12px`,
		transition: `border-color 300ms ${kStrongEaseOut}`,
	};

	if (selected.value) {
		result.borderColor = kThemePrimary;
	}

	if (disabled.value) {
		result.opacity = 0.5;
	} else {
		result.cursor = `pointer`;
	}

	return result;
});

function onClickSticker(event: Event) {
	if (disabled.value) {
		return;
	}

	emit('click', event);
}
</script>

<template>
	<div :style="baseStyles" @click="onClickSticker">
		<AppStickerImg :src="sticker.img_url" :style="{ width: `100%`, height: `100%` }" />

		<div
			:style="[
				styleFlexCenter(),
				{
					position: `absolute`,
					left: `4px`,
					top: `4px`,
					width: `24px`,
					height: `24px`,
					zIndex: 1,
					pointerEvents: `none`,
					borderRadius: `50%`,
					transition: `opacity 300ms ${kStrongEaseOut}`,
					opacity: 0,
					backgroundColor: kThemePrimary,
				},
				styleWhen(selected, {
					opacity: 1,
				}),
			]"
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
