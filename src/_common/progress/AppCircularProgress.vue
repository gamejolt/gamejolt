<script lang="ts" setup>
import { Ref, computed, ref, toRefs } from 'vue';
import {
	styleAbsoluteFill,
	styleFlexCenter,
	styleMaxWidthForOptions,
	styleWhen,
} from '../../_styles/mixins';
import { kBorderWidthLg } from '../../_styles/variables';
import { useResizeObserver } from '../../utils/resize-observer';
import AppAspectRatio from '../aspect-ratio/AppAspectRatio.vue';
import { kThemeFg10, kThemePrimary, kThemePrimaryFg } from '../theme/variables';

const props = defineProps({
	percent: {
		type: Number,
		default: undefined,
	},
	strokeWidth: {
		type: Number,
		default: kBorderWidthLg.value * 2,
	},
	transitionMs: {
		type: Number,
		default: 500,
	},
});

const { percent, strokeWidth } = toRefs(props);

const emit = defineEmits({
	'after-transition': () => true,
});

const root = ref() as Ref<HTMLDivElement>;
const parentSize = ref({ width: 0, height: 0 });

/**
 * NOTE: Formatting was breaking due to a non-null assertion in the template.
 * Using this to avoid that.
 */
const safePercent = computed(() => percent?.value ?? 0);

const smallestSide = computed(() => Math.min(parentSize.value.width, parentSize.value.height));
const trackLength = computed(() => 2 * Math.PI * (smallestSide.value / 2));
const trackLength75 = computed(() => trackLength.value * 0.75);
const radius = computed(() => smallestSide.value / 2 - strokeWidth.value / 2);

const indeterminate = computed(() => typeof percent?.value !== 'number');

useResizeObserver({
	target: root,
	callback(entries) {
		const { width, height } = entries[0].contentRect;
		parentSize.value = { width, height };
	},
});
</script>

<template>
	<div
		ref="root"
		:style="{
			...styleFlexCenter(),
			width: `100%`,
			height: `100%`,
		}"
	>
		<div
			:style="{
				...styleMaxWidthForOptions({
					ratio: 1,
					maxWidth: parentSize.width,
					maxHeight: parentSize.height,
				}),
				width: `100%`,
			}"
		>
			<AppAspectRatio :ratio="1" show-overflow>
				<div
					:style="[
						styleAbsoluteFill(),
						styleFlexCenter({
							direction: `column`,
						}),
					]"
				>
					<slot />
				</div>

				<svg
					v-if="smallestSide > 0"
					class="_svg"
					:width="smallestSide"
					:height="smallestSide"
					:viewBox="`0 0 ${smallestSide} ${smallestSide}`"
					:style="{
						...styleAbsoluteFill(),
						transform: `rotate(-90deg)`,
					}"
				>
					<circle
						cx="50%"
						cy="50%"
						:r="radius"
						:style="{
							fill: `none`,
							stroke: `var(--bg-stroke)`,
							strokeWidth: strokeWidth,
						}"
					/>
					<circle
						cx="50%"
						cy="50%"
						:r="radius"
						:class="{ '_anim-indeterminate': indeterminate }"
						:style="{
							fill: `none`,
							stroke: `var(--fg-stroke)`,
							strokeWidth: strokeWidth,
							strokeLinecap: `round`,
							strokeDasharray: trackLength,
							...styleWhen(!indeterminate, {
								transition: `stroke-dashoffset ${transitionMs}ms ease-in-out`,
								strokeDashoffset: `${
									trackLength * (-safePercent + 1) + strokeWidth
								}px`,
							}),
						}"
						@transitionend="emit('after-transition')"
					/>
				</svg>
			</AppAspectRatio>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
._svg
	--bg-stroke: v-bind(kThemeFg10)
	--fg-stroke: v-bind(kThemePrimary)

	.button:hover &
	.button:not(.-outline) &
		--bg-stroke: unquote('rgba(var(--theme-primary-fg-rgb), 0.2)')
		--fg-stroke: v-bind(kThemePrimaryFg)

._anim-indeterminate
	animation: indeterminate 1s linear infinite forwards
	transform-origin: center center

@keyframes indeterminate
	0%
		stroke-dashoffset: v-bind(trackLength)
		transform: rotate(0deg)

	25%
		stroke-dashoffset: v-bind(trackLength75)

	50%
		stroke-dashoffset: v-bind(trackLength75)

	100%
		stroke-dashoffset: v-bind(trackLength)
		transform: rotate(360deg)
</style>
