<script lang="ts" setup>
import { CSSProperties, PropType } from 'vue';

/**
 * Used to create a box that takes the full-width of its parent and sizes its
 * height based on a ratio from that.
 *
 * Since the aspect-ratio CSS property doesn't work on older browsers, we have
 * to do some stupid hacks to get this working.
 */
defineProps({
	ratio: {
		type: Number,
		required: true,
	},
	showOverflow: {
		type: Boolean,
	},
	innerStyles: {
		type: Object as PropType<CSSProperties>,
		default: undefined,
	},
});
</script>

<template>
	<div
		:style="{
			position: `relative`,
			height: 0,
			paddingTop: `${100 / ratio}%`,
			overflow: !showOverflow ? 'hidden' : undefined,
		}"
	>
		<div
			:style="{
				position: `absolute`,
				top: 0,
				left: 0,
				width: `100%`,
				height: `100%`,
				...innerStyles,
			}"
		>
			<slot />
		</div>
	</div>
</template>
