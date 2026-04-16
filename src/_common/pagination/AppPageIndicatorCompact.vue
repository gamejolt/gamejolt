<script lang="ts" setup>
import { computed, CSSProperties } from 'vue';

import AppPageIndicatorCompactItem from '~common/pagination/AppPageIndicatorCompactItem.vue';
import { styleFlexCenter, styleWhen } from '~styles/mixins';

type Props = {
	count: number;
	current: number;
	innerStyles?: CSSProperties;
};
const { count, current, innerStyles } = defineProps<Props>();

const sizeBase = 8;

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
	<div
		:style="{
			...styleFlexCenter({ direction: 'row' }),
			minHeight: `${sizeBase}px`,
		}"
	>
		<div
			:style="{
				display: `inline-flex`,
				alignItems: `center`,
				gap: `4px`,
				flexWrap: `nowrap`,
				...innerStyles,
				position: `relative`,
			}"
		>
			<TransitionGroup name="list">
				<template v-for="i of count" :key="i">
					<div
						v-if="shouldShowItem(i)"
						:class="{
							_pre: i - current < 0,
							_post: i - current > 0,
						}"
						:style="{
							...styleFlexCenter(),
							width: `${sizeBase}px`,
							height: `${sizeBase}px`,
							// Pin the first and last items to the edges.
							// Helps with transitions.
							...styleWhen(i === current - edgeCount, {
								left: 0,
							}),
							...styleWhen(i === current + edgeCount, {
								right: 0,
							}),
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
