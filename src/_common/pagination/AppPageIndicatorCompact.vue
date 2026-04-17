<script lang="ts" setup>
import { computed, CSSProperties } from 'vue';

import AppPageIndicatorCompactItem from '~common/pagination/AppPageIndicatorCompactItem.vue';

type Props = {
	count: number;
	current: number;
	innerStyles?: CSSProperties;
};
const { count, current, innerStyles } = defineProps<Props>();

const displayCount = computed(() => Math.min(count, 5));
const edgeCount = computed(() => Math.floor(displayCount.value / 2));

function shouldShowItem(offset: number) {
	const itemsPerEdge = edgeCount.value;
	if (current <= itemsPerEdge) {
		return offset <= displayCount.value;
	} else if (current >= count - itemsPerEdge) {
		return count - offset < displayCount.value;
	}
	return offset === current || Math.abs(offset - current) <= itemsPerEdge;
}
</script>

<template>
	<div class="flex flex-row items-center justify-center min-h-[8px]">
		<div
			class="inline-flex items-center gap-[4px] flex-nowrap relative"
			:style="innerStyles"
		>
			<TransitionGroup name="list">
				<template v-for="i of count" :key="i">
					<div
						v-if="shouldShowItem(i)"
						class="flex items-center justify-center w-[8px] h-[8px]"
						:class="{
							_pre: i - current < 0,
							_post: i - current > 0,
						}"
						:style="{
							// Pin the first and last items to the edges.
							// Helps with transitions.
							left: i === current - edgeCount ? 0 : undefined,
							right: i === current + edgeCount ? 0 : undefined,
						}"
					>
						<AppPageIndicatorCompactItem
							:count="count"
							:current="current"
							:display-count="displayCount"
							:index="i"
						/>
					</div>
				</template>
			</TransitionGroup>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.list-move
.list-enter-active
.list-leave-active
	transition: transform 500ms $strong-ease-out, opacity 500ms $strong-ease-out

.list-enter-from
.list-leave-to
	opacity: 0

	&._pre
		transform: translateX(-100%)

	&._post
		transform: translateX(100%)

.list-leave-active
	position: absolute
</style>
