<script lang="ts" setup>
import { computed, PropType, toRefs } from 'vue';
import AppJolticon from '../../jolticon/AppJolticon.vue';
import { Screen } from '../../screen/screen-service';
import { DurationBackpackItem, QuestRewardData } from './AppQuestRewardModal.vue';

const props = defineProps({
	data: {
		type: Object as PropType<QuestRewardData>,
		required: true,
	},
});

const { data } = toRefs(props);

const pathData = computed(() => {
	const rand = data.value.random - 0.5;
	const { width, height } = Screen;

	const center = width / 2;
	const startX = center + rand * (width / 2);

	const randY = 32 * (rand - 0.5);
	const startY = height * 0.5 - randY;

	const endX = width / 2;
	const endY = height - 512 * 0.25;

	const path = [
		`M`,
		`${startX},${startY}`,
		`C`,
		`${(center + startX) / 2},${startY / 2}`,
		`${center},${height * 0.5}`,
		`${endX},${endY}`,
	].join(' ');

	return { path, fromRight: startX > center };
});
</script>

<template>
	<div
		class="-backpack-item"
		:class="`-item-${pathData.fromRight ? 'right' : 'left'}`"
		:style="{
			offsetPath: `path('${pathData.path}')`,
			animationDuration: DurationBackpackItem + 'ms',
		}"
	>
		<img v-if="data.img_url" class="-img" :src="data.img_url" alt="" />
		<AppJolticon v-else :icon="data.icon" />
	</div>
</template>

<style lang="stylus" scoped>
$-backpack-item-size = 64px

.-backpack-item
	animation-name: anim-item-flight
	animation-fill-mode: both
	animation-timing-function: cubic-bezier(.3,.4,.5,-0.03)
	position: absolute
	top: 0

	&.-item-right
		animation-name: anim-item-flight, anim-item-right

	&.-item-left
		animation-name: anim-item-flight, anim-item-left

	> *
		font-size: $-backpack-item-size * 0.75
		width: $-backpack-item-size
		height: $-backpack-item-size

.-img
	rounded-corners()

@keyframes anim-item-flight
	0%
		offset-distance: 0%
		opacity: 0

	10%
		opacity: 1

	90%
		opacity: 1

	100%
		offset-distance: 100%
		opacity: 0

@keyframes anim-item-left
	0%
		offset-rotate: -60deg

	100%
		offset-rotate: 30deg

@keyframes anim-item-right
	0%
		offset-rotate: 60deg

	100%
		offset-rotate: -30deg
</style>
