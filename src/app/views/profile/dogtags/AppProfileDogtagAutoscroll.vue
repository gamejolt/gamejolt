<script lang="ts" setup>
import { computed, ref } from 'vue';
import { Ruler } from '../../../../_common/ruler/ruler-service';
import { styleWhen } from '../../../../_styles/mixins';
import { useResizeObserver } from '../../../../utils/resize-observer';

const root = ref<HTMLElement>();
const child = ref<HTMLElement>();

const sizeDiff = ref(0);

let hasQueuedAction = false;

function queueAction() {
	if (hasQueuedAction) {
		return;
	}
	hasQueuedAction = true;
	window.requestAnimationFrame(() => {
		if (!root.value || !child.value) {
			sizeDiff.value = 0;
			return;
		}
		const rootWidth = Ruler.width(root.value);
		const childWidth = Ruler.width(child.value);

		sizeDiff.value = childWidth - rootWidth;
		hasQueuedAction = false;
	});
}

useResizeObserver({ target: root, callback: () => queueAction() });
useResizeObserver({ target: child, callback: () => queueAction() });

const autoscrollDuration = computed(() => {
	// Rough scroll speed. Doesn't account for animation easing or time spend
	// "looping" the animation.
	const pixelsPerSecond = 25;
	return Math.max(1_000, sizeDiff.value * (1_000 / pixelsPerSecond));
});
</script>

<template>
	<div
		v-if="$slots.default"
		:style="[
			`--size-translation: ${-sizeDiff}px`,
			`--bleed: 6px`,
			{
				overflow: `hidden`,
				display: `block`,
				width: `100%`,
				maxWidth: `100%`,
				minWidth: 0,
				marginLeft: `0 - var(--bleed)`,
				marginRight: `0 - var(--bleed)`,
				paddingLeft: `var(--bleed)`,
				paddingRight: `var(--bleed)`,
				...styleWhen(sizeDiff > 0, {
					maskImage: `linear-gradient(to right, transparent 0, black var(--bleed), black calc(100% - var(--bleed)), transparent 100%)`,
				}),
			},
		]"
	>
		<div ref="root">
			<div
				ref="child"
				:class="{
					_autoscroll: sizeDiff > 0,
				}"
				:style="{
					display: `inline-block`,
					minWidth: 0,
					width: `fit-content`,
					maxWidth: `unset`,
					whiteSpace: `nowrap`,
					animationDuration: `${autoscrollDuration}ms`,
					animationTimingFunction: `ease`,
					animationIterationCount: `infinite`,
					animationFillMode: `both`,
				}"
			>
				<slot />
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
._autoscroll
	animation-name: anim-autoscroll

@keyframes anim-autoscroll
	0%
		transform: translateX(0)
		opacity: 0
	10%
		transform: translateX(0)
		opacity: 1
	90%
		transform: translateX(var(--size-translation))
		opacity: 1
	100%
		transform: translateX(var(--size-translation))
		opacity: 0
</style>
