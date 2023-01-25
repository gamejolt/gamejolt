<script lang="ts" setup>
import { computed, PropType, toRefs } from 'vue';
import { AvatarFrame } from './frame.model';

const BASE_INSET = -10;
const BASE_SIZE = 100 - BASE_INSET * 2;

const props = defineProps({
	frame: {
		type: Object as PropType<AvatarFrame | null | undefined>,
		required: true,
	},
	inset: {
		type: Number,
		default: undefined,
	},
});

const { frame, inset } = toRefs(props);

const frameInset = computed(() => {
	const base = `${BASE_INSET}%`;
	if (!inset?.value) {
		return base;
	}
	return `calc(${base} + ${inset.value}px)`;
});

const frameSize = computed(() => {
	const base = `${BASE_SIZE}%`;
	if (!inset?.value) {
		return base;
	}
	return `calc(${base} - ${inset.value * 2}px)`;
});
</script>

<template>
	<div
		:style="{
			position: `relative`,
		}"
	>
		<div
			:style="{
				zIndex: 0,
			}"
		>
			<slot />
		</div>

		<img
			v-if="frame"
			:style="{
				position: `absolute`,
				top: frameInset,
				right: frameInset,
				bottom: frameInset,
				left: frameInset,
				width: frameSize,
				height: frameSize,
				pointerEvents: `none`,
				zIndex: 1,
			}"
			:src="frame.image_url"
			alt=""
		/>
	</div>
</template>
