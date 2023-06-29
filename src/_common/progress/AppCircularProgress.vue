<script lang="ts" setup>
import { Ref, computed, onMounted, ref, toRefs } from 'vue';
import { styleAbsoluteFill, styleFlexCenter, styleWhen } from '../../_styles/mixins';
import { kBorderWidthLg } from '../../_styles/variables';
import { debounceWithMaxTimeout } from '../../utils/utils';
import AppAspectRatio from '../aspect-ratio/AppAspectRatio.vue';
import { vAppObserveDimensions } from '../observe-dimensions/observe-dimensions.directive';
import { kThemeFg10, kThemePrimary } from '../theme/variables';

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
const parentSize = ref<number>(0);

/**
 * NOTE: Formatting was breaking due to a non-null assertion in the template.
 * Using this to avoid that.
 */
const safePercent = computed(() => percent?.value ?? 0);

const trackLength = computed(() => 2 * Math.PI * (parentSize.value / 2));
const trackLength75 = computed(() => trackLength.value * 0.75);
const radius = computed(() => parentSize.value / 2 - strokeWidth.value / 2);

const indeterminate = computed(() => typeof percent?.value !== 'number');

onMounted(() => {
	parentSize.value = root.value.clientWidth;
});

function onDimensionsChanged(entries: ResizeObserverEntry[]) {
	parentSize.value = entries[0].contentRect.width;
}

const debounceDimensionsChanged = debounceWithMaxTimeout(onDimensionsChanged, 100, 500);
</script>

<template>
	<div
		ref="root"
		v-app-observe-dimensions="debounceDimensionsChanged.call"
		:style="{
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
				v-if="parentSize > 0"
				:width="parentSize"
				:height="parentSize"
				:viewBox="`0 0 ${parentSize} ${parentSize}`"
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
						stroke: kThemeFg10,
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
						stroke: kThemePrimary,
						strokeWidth: strokeWidth,
						strokeLinecap: `round`,
						strokeDasharray: trackLength,
						...styleWhen(!indeterminate, {
							transition: `stroke-dashoffset ${transitionMs}ms ease-in-out`,
							strokeDashoffset: `${trackLength * (-safePercent + 1) + strokeWidth}px`,
						}),
					}"
					@transitionend="emit('after-transition')"
				/>
			</svg>
		</AppAspectRatio>
	</div>
</template>

<style lang="stylus" scoped>
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
