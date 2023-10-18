<script lang="ts" setup>
import { computed, CSSProperties, PropType, toRefs } from 'vue';
import AppAspectRatio from '../aspect-ratio/AppAspectRatio.vue';
import { AvatarFrameModel, DefaultAvatarFrameScale } from './frame.model';

const props = defineProps({
	frame: {
		type: [Object, null] as PropType<Pick<AvatarFrameModel, 'image_url' | 'scale'> | null>,
		required: true,
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

const { frame, hideFrame, smoosh } = toRefs(props);

const avatarStyling = computed(() => {
	const result: CSSProperties = {
		position: `absolute`,
		zIndex: 0,
	};

	let inset = `0%`;
	let size = `100%`;

	if (frame.value && smoosh.value) {
		const smooshedSize = 100 / frame.value.scale;
		inset = `${(100 - smooshedSize) / 2}%`;
		size = `${smooshedSize}%`;
	}

	result.top = inset;
	result.right = inset;
	result.bottom = inset;
	result.left = inset;

	result.width = size;
	result.height = size;

	return result;
});

const frameStyling = computed(() => {
	const result: CSSProperties = {
		position: `absolute`,
		pointerEvents: `none`,
		zIndex: 1,
	};

	const scale = frame.value?.scale || DefaultAvatarFrameScale;
	const expandedSize = 100 * scale;
	let insetBase = `-${(expandedSize - 100) / 2}%`;
	let sizeBase = `${expandedSize}%`;

	if (frame.value && smoosh.value) {
		insetBase = `0%`;
		sizeBase = `100%`;
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
