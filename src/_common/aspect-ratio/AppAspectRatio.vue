<script lang="ts" setup>
import { computed, CSSProperties, StyleValue } from 'vue';

import { styleFlexCenter, styleWhen } from '../../_styles/mixins';

/**
 * Used to create a box that takes the full-width of its parent and sizes its
 * height based on a ratio from that.
 *
 * Since the aspect-ratio CSS property doesn't work on older browsers, we have
 * to do some stupid hacks to get this working.
 */
type Props = {
	ratio: number;
	childRatio?: number;
	showOverflow?: boolean;
	innerStyles?: StyleValue;
};
const { ratio, childRatio, showOverflow, innerStyles = [] } = defineProps<Props>();

const childSizing = computed<CSSProperties>(() => {
	const fill = `100%`;
	const inner = childRatio;
	const outer = ratio;

	if (inner === undefined || inner === outer) {
		return {
			width: fill,
			height: fill,
		};
	}

	const isThinnerChild = inner < outer;
	const inset = `${(isThinnerChild ? inner / outer : outer / inner) * 100}%`;
	if (isThinnerChild) {
		return {
			width: inset,
			height: fill,
		};
	}
	return {
		width: fill,
		height: inset,
	};
});
</script>

<template>
	<div
		:style="[
			{
				position: `relative`,
				height: 0,
				paddingTop: `${100 / ratio}%`,
			},
			styleWhen(!showOverflow, {
				overflow: `hidden`,
			}),
		]"
	>
		<div
			:style="[
				{
					position: `absolute`,
					top: 0,
					left: 0,
					width: `100%`,
					height: `100%`,
				},
				styleWhen(childSizing.width !== childSizing.height, styleFlexCenter()),
			]"
		>
			<div :style="[childSizing, { position: `relative` }, innerStyles]">
				<slot />
			</div>
		</div>
	</div>
</template>
