<script lang="ts" setup>
import { computed, PropType, toRefs } from 'vue';
import { styleBorderRadiusBase, styleFlexCenter, styleWhen } from '../../../_styles/mixins';
import { kBorderWidthLg, kFontSizeTiny } from '../../../_styles/variables';
import { kThemeBacklight, kThemeBgActual, kThemeBgOffset } from '../../theme/variables';
import { ReactionCount } from '../reaction.model';

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
const displayText = computed(() => {
	if (reaction.value) {
		return reaction.value.count;
	}
	return 'Add';
});

const shouldHighlight = computed(() => {
	if (!reaction.value) {
		return false;
	}
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
		<div
			:style="{
				width: `${size}px`,
				height: `auto`,
				maxHeight: `${size}px`,
				...styleWhen(!reaction, styleFlexCenter()),
			}"
		>
			<img
				:style="{
					display: `block`,
					width: `100%`,
					height: `100%`,
				}"
				:src="imgUrl"
				@dragstart.prevent
			/>
		</div>

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
