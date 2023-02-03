<script lang="ts" setup>
import { computed, CSSProperties, PropType, toRefs } from 'vue';
import AppAspectRatio from '../aspect-ratio/AppAspectRatio.vue';
import { AvatarFrame } from './frame.model';

const BASE_FRAME_INSET = -10;
const BASE_FRAME_SIZE = 100 - BASE_FRAME_INSET * 2;

const props = defineProps({
	frame: {
		type: [Object, null] as PropType<AvatarFrame | null>,
		required: true,
	},
	inset: {
		type: Number,
		default: undefined,
	},
	hideFrame: {
		type: Boolean,
	},
	/**
	 * Treats the frame as a border that insets our avatar instead of the having
	 * the frame extend the container bounds.
	 */
	smoosh: {
		type: Boolean,
	},
});

const { frame, inset, hideFrame, smoosh } = toRefs(props);

const avatarStyling = computed(() => {
	const result: CSSProperties = {
		position: `absolute`,
		zIndex: 0,
	};

	let insetBase = `0px`;
	let sizeBase = `100%`;

	if (frame.value && smoosh.value) {
		insetBase = `${BASE_FRAME_INSET * -1}%`;
		sizeBase = `${100 + BASE_FRAME_INSET * 2}%`;
	}

	result.top = insetBase;
	result.right = insetBase;
	result.bottom = insetBase;
	result.left = insetBase;

	result.width = sizeBase;
	result.height = sizeBase;

	return result;
});

const frameStyling = computed(() => {
	const result: CSSProperties = {
		position: `absolute`,
		pointerEvents: `none`,
		zIndex: 1,
	};

	let insetBase = `${BASE_FRAME_INSET}%`;
	let sizeBase = `${BASE_FRAME_SIZE}%`;

	if (frame.value && smoosh.value) {
		insetBase = `0px`;
		sizeBase = `100%`;
	} else if (inset?.value) {
		insetBase = `calc(${insetBase} + ${inset.value}px)`;
		sizeBase = `calc(${sizeBase} - ${inset.value * 2}px)`;
	}

	result.top = insetBase;
	result.right = insetBase;
	result.bottom = insetBase;
	result.left = insetBase;

	result.width = sizeBase;
	result.height = sizeBase;

	return result;
});
</script>

<template>
	<!-- AppAvatarFrame -->
	<div
		:style="{
			position: `relative`,
		}"
	>
		<AppAspectRatio :ratio="1" show-overflow>
			<div :style="avatarStyling">
				<slot />
			</div>

			<img v-if="frame && !hideFrame" :style="frameStyling" :src="frame.image_url" alt="" />
		</AppAspectRatio>
	</div>
</template>
