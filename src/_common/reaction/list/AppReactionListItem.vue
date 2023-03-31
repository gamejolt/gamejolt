<script lang="ts" setup>
import { computed, PropType, toRefs } from 'vue';
import { styleBorderRadiusBase } from '../../../_styles/mixins';
import { kBorderWidthLg, kFontSizeTiny } from '../../../_styles/variables';
import { kThemeBacklight, kThemeBgActual, kThemeBgOffset } from '../../theme/variables';
import { ReactionCount } from '../reaction-count';

const props = defineProps({
	reaction: {
		type: Object as PropType<ReactionCount>,
		required: true,
	},
	focusedId: {
		type: Number,
		default: undefined,
	},
	size: {
		type: Number,
		default: 20,
		validator: val => typeof val === 'number' && val > 0,
	},
});

const { reaction, focusedId, size } = toRefs(props);

const emojiId = computed(() => reaction.value.id);
const imgUrl = computed(() => reaction.value.img_url);
const didReact = computed(() => reaction.value.did_react === true);
const displayText = computed(() => reaction.value.count);

const shouldHighlight = computed(() => {
	if (focusedId?.value) {
		return focusedId.value === emojiId.value;
	}
	return didReact.value;
});

const borderColor = computed(() => {
	if (focusedId?.value || !shouldHighlight.value) {
		return 'transparent';
	}
	return kThemeBacklight;
});

const bgColor = computed(() => {
	const nonHighlightBg = focusedId?.value ? kThemeBgActual : kThemeBgOffset;
	if (shouldHighlight.value) {
		return kThemeBgOffset;
	}
	return nonHighlightBg;
});
</script>

<template>
	<!-- AppReactionListItem -->
	<div
		:style="{
			...styleBorderRadiusBase,
			backgroundColor: bgColor,
			display: `inline-flex`,
			alignItems: `center`,
			padding: `0px 4px`,
			border: `${kBorderWidthLg.px} solid ${borderColor}`,
			userSelect: `none`,
		}"
	>
		<img
			:style="{
				width: `${size}px`,
				height: `auto`,
				maxHeight: `${size}px`,
			}"
			:src="imgUrl"
			alt=""
			@dragstart.prevent
		/>

		<div
			:style="{
				fontSize: kFontSizeTiny.px,
				padding: `4px`,
			}"
		>
			{{ displayText }}
		</div>
	</div>
</template>
