<script lang="ts" setup>
import { CSSProperties, computed, toRefs } from 'vue';
import { styleAbsoluteFill, styleWhen } from '../../_styles/mixins';
import { kStrongEaseOut } from '../../_styles/variables';

const props = defineProps({
	noEdges: {
		type: Boolean,
	},
	fadeOpacity: {
		type: Number,
		default: 0.1,
	},
	zIndex: {
		type: Number,
		default: undefined,
	},
});

const { zIndex: zIndexProp } = toRefs(props);

function createFadeStyles(edge: 'top' | 'bottom') {
	const zIndex = zIndexProp?.value;
	const imageDirection = edge === 'top' ? 'bottom' : 'top';
	return {
		position: `absolute`,
		left: 0,
		right: 0,
		[edge]: 0,
		height: `150px`,
		maxHeight: `100%`,
		backgroundRepeat: `no-repeat`,
		backgroundSize: `cover`,
		backgroundImage: `linear-gradient(to ${imageDirection}, rgba(0, 0, 0, 0.3),  rgba(0, 0, 0, 0))`,
		backgroundPosition: edge,
		...styleWhen(zIndex !== undefined, {
			zIndex,
		}),
	} satisfies CSSProperties;
}

const fadeTopStyles = computed(() => createFadeStyles('top'));
const fadeBottomStyles = computed(() => createFadeStyles('bottom'));
</script>

<template>
	<div v-if="!noEdges" :style="fadeTopStyles" />
	<div
		:style="{
			...styleAbsoluteFill({ zIndex }),
			backgroundColor: `rgba(0, 0, 0, ${fadeOpacity})`,
			transition: `background-color 300ms ${kStrongEaseOut}`,
		}"
	/>
	<div v-if="!noEdges" :style="fadeBottomStyles" />
</template>
