<script lang="ts" setup>
import { CSSProperties, PropType, StyleValue, computed, toRefs } from 'vue';
import { styleFlexCenter, styleWhen } from '../../_styles/mixins';

/**
 * Used to create a box that takes the full-width of its parent and sizes its
 * height based on a ratio from that.
 *
 * Since the aspect-ratio CSS property doesn't work on older browsers, we have
 * to do some stupid hacks to get this working.
 */
const props = defineProps({
	ratio: {
		type: Number,
		required: true,
	},
	childRatio: {
		type: Number,
		default: undefined,
	},
	showOverflow: {
		type: Boolean,
	},
	innerStyles: {
		type: [Object, Array, String] as PropType<StyleValue>,
		default: () => [],
	},
});

const { ratio, childRatio } = toRefs(props);

const childSizing = computed<CSSProperties>(() => {
	const fill = `100%`;
	const inner = childRatio?.value;
	const outer = ratio.value;

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
				innerStyles,
			]"
		>
			<div :style="[childSizing, { position: `relative` }]">
				<slot />
			</div>
		</div>
	</div>
</template>
