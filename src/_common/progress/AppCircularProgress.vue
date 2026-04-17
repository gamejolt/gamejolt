<script lang="ts" setup>
import { computed, Ref, ref } from 'vue';

import AppAspectRatio from '~common/aspect-ratio/AppAspectRatio.vue';
import { kThemeFg10, kThemePrimary, kThemePrimaryFg } from '~common/theme/variables';
import { styleMaxWidthForOptions } from '~styles/mixins';
import { kBorderWidthLg } from '~styles/variables';
import { useResizeObserver } from '~utils/resize-observer';

type Props = {
	percent?: number;
	strokeWidth?: number;
	transitionMs?: number;
};
const {
	percent,
	strokeWidth = kBorderWidthLg.value * 2,
	transitionMs = 500,
} = defineProps<Props>();

const emit = defineEmits<{
	'after-transition': [];
}>();

const root = ref() as Ref<HTMLDivElement>;
const parentSize = ref({ width: 0, height: 0 });

/**
 * NOTE: Formatting was breaking due to a non-null assertion in the template.
 * Using this to avoid that.
 */
const safePercent = computed(() => percent ?? 0);

const smallestSide = computed(() => Math.min(parentSize.value.width, parentSize.value.height));
const trackLength = computed(() => 2 * Math.PI * (smallestSide.value / 2));
const trackLength75 = computed(() => trackLength.value * 0.75);
const radius = computed(() => smallestSide.value / 2 - strokeWidth / 2);

const indeterminate = computed(() => typeof percent !== 'number');

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
		class="flex items-center justify-center"
		:style="{
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
					v-if="$slots.default"
					class="absolute inset-0 flex flex-col items-center justify-center"
				>
					<slot />
				</div>

				<svg
					v-if="smallestSide > 0"
					class="_svg absolute inset-0"
					:width="smallestSide"
					:height="smallestSide"
					:viewBox="`0 0 ${smallestSide} ${smallestSide}`"
					:style="{
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
							transition: !indeterminate
								? `stroke-dashoffset ${transitionMs}ms ease-in-out`
								: undefined,
							strokeDashoffset: !indeterminate
								? `${trackLength * (-safePercent + 1) + strokeWidth}px`
								: undefined,
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
