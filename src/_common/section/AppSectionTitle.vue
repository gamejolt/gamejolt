<script lang="ts" setup>
import { computed, toRefs } from 'vue';
import { styleMaxWidthForOptions, styleTextOverflow, styleWhen } from '../../_styles/mixins';
import { kFontSizeLarge } from '../../_styles/variables';
import AppSpacer from '../spacer/AppSpacer.vue';

const props = defineProps({
	avatarHeight: {
		type: Number,
		default: 36,
		validator: (val: number) => val > 0,
	},
	avatarAspectRatio: {
		type: Number,
		default: 1,
	},
	center: {
		type: Boolean,
	},
});

const { avatarAspectRatio, avatarHeight, center } = toRefs(props);

const maxWidth = computed(() =>
	styleMaxWidthForOptions({
		ratio: avatarAspectRatio.value,
		maxHeight: avatarHeight.value,
	})
);
</script>

<template>
	<div
		:style="{
			display: `flex`,
			alignItems: `center`,
			...styleWhen(center, {
				justifyContent: `center`,
			}),
		}"
	>
		<div
			:style="{
				...maxWidth,
				height: `${avatarHeight}px`,
				flexGrow: 1,
				flexShrink: 0,
				flexBasis: `100%`,
			}"
		>
			<slot name="avatar" />
		</div>

		<AppSpacer :scale="3" horizontal />

		<div :style="{ minWidth: 0 }">
			<div
				v-if="$slots.supertitle"
				:style="{
					fontSize: `12px`,
					fontWeight: `bold`,
					...styleTextOverflow,
				}"
			>
				<slot name="supertitle" />
			</div>
			<div
				v-if="$slots.title"
				:style="{
					fontSize: `${kFontSizeLarge.value + 1}px`,
					fontWeight: `bolder`,
					...styleTextOverflow,
				}"
			>
				<slot name="title" />
			</div>
		</div>
	</div>
</template>
