<script lang="ts" setup>
import { computed, PropType, toRefs } from 'vue';
import AppImgResponsive from '../img/AppImgResponsive.vue';
import AppJolticon, { Jolticon } from '../jolticon/AppJolticon.vue';
import AppQuestFrame from './AppQuestFrame.vue';
import { Quest } from './quest-model';

const props = defineProps({
	quest: {
		type: Object as PropType<Quest>,
		required: true,
	},
});

const { quest } = toRefs(props);

const metaData = computed<{ text?: string; icon?: Jolticon; bubble?: boolean } | undefined>(() => {
	const q = quest.value;
	if (q.isExpired) {
		return;
	}

	if (q.is_new) {
		return { text: 'NEW!' };
	} else if (q.has_activity) {
		// TODO(quests) present jolticon
		return { icon: 'other-os' };
	} else if (q.isAllComplete) {
		return { icon: 'star', bubble: true };
	} else if (q.isComplete) {
		return { icon: 'check', bubble: true };
	}

	return;
});
</script>

<template>
	<div class="-frame">
		<AppQuestFrame>
			<AppImgResponsive class="-img" :src="quest.avatar.mediaserver_url" alt="Quest Image" />
		</AppQuestFrame>

		<div v-if="metaData" class="-meta" :class="{ '-bubble': metaData.bubble }">
			<AppJolticon v-if="metaData.icon" class="-icon" :icon="metaData.icon" />
			<span v-else-if="metaData.text">{{ metaData.text }}</span>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.-frame
	position: relative

.-img
	width: 100%
	height: 100%
	object-fit: cover

.-meta
	position: absolute
	top: ($font-size-tiny / 2)
	right: ($font-size-tiny / 2)
	font-weight: bold
	color: var(--theme-link)
	text-shadow: 0 0 4px var(--theme-link)
	font-size: $font-size-tiny
	z-index: 1

	.jolticon
		margin: 0
		padding: 0

	&.-bubble
		img-circle()
		elevate-1()
		color: var(--theme-bi-fg)
		background-color: var(--theme-bi-bg)
		padding: 2px
		text-shadow: none
		display: flex
		align-items: center
		justify-content: center
</style>
