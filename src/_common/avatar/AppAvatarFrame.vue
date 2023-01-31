<script lang="ts" setup>
import { computed, CSSProperties, PropType, toRefs } from 'vue';
import { AvatarFrame } from './frame.model';

const BASE_INSET = -10;
const BASE_SIZE = 100 - BASE_INSET * 2;

const props = defineProps({
	frame: {
		type: [Object, null, undefined] as PropType<AvatarFrame | null | undefined>,
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
	 * Treats the avatar frame as a border that insets our content, rather than
	 * an overlay that exceeds the container bounds.
	 */
	shrinkOnShow: {
		type: Boolean,
	},
});

const { frame, inset, hideFrame, shrinkOnShow } = toRefs(props);

const rootStyles = computed(() => {
	const result: CSSProperties = {
		position: `relative`,
	};

	if (shrinkOnShow.value && !!frame.value && !hideFrame.value) {
		result.transform = `scale(${100 / BASE_SIZE})`;
	}

	return result;
});

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
	<!-- AppAvatarFrame -->
	<div :style="rootStyles">
		<div
			:style="{
				zIndex: 0,
			}"
		>
			<slot />
		</div>

		<img
			v-if="frame && !hideFrame"
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
