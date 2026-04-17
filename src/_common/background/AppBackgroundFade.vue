<script lang="ts" setup>
import { computed, CSSProperties } from 'vue';

import { kStrongEaseOut } from '~styles/variables';

type Props = {
	noEdges?: boolean;
	fadeOpacity?: number;
	zIndex?: number;
};
const { noEdges, fadeOpacity = 0.1, zIndex } = defineProps<Props>();

function createFadeStyles(edge: 'top' | 'bottom') {
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
		zIndex,
	} satisfies CSSProperties;
}

const fadeTopStyles = computed(() => createFadeStyles('top'));
const fadeBottomStyles = computed(() => createFadeStyles('bottom'));
</script>

<template>
	<div v-if="!noEdges" :style="fadeTopStyles" />
	<div
		class="absolute inset-0"
		:style="{
			zIndex,
			backgroundColor: `rgba(0, 0, 0, ${fadeOpacity})`,
			transition: `background-color 300ms ${kStrongEaseOut}`,
		}"
	/>
	<div v-if="!noEdges" :style="fadeBottomStyles" />
</template>
