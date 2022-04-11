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
	iconSize: {
		type: String as PropType<'sm' | 'base'>,
		default: 'base',
	},
	hideMeta: {
		type: Boolean,
	},
	active: {
		type: Boolean,
	},
});

const { quest, hideMeta, active } = toRefs(props);

const isActive = computed(() => active.value || quest.value.is_new);

const metaData = computed<{ text?: string; icon?: Jolticon; bubble?: boolean } | undefined>(() => {
	if (hideMeta.value) {
		return;
	}

	const q = quest.value;
	if (q.has_activity) {
		return { bubble: true };
	} else if (q.isAllComplete) {
		return { icon: 'star', bubble: true };
	} else if (q.isComplete) {
		return { icon: 'check', bubble: true };
	} else if (q.is_new && !q.isExpired) {
		return { text: 'NEW!' };
	}
});
</script>

<template>
	<div class="-frame">
		<AppQuestFrame :active="isActive">
			<AppImgResponsive class="-img" :src="quest.avatar.mediaserver_url" alt="Quest Image" />
		</AppQuestFrame>

		<div v-if="metaData" class="-meta" :class="{ '-bubble': metaData.bubble }">
			<AppJolticon v-if="metaData.icon" :class="`-icon-${iconSize}`" :icon="metaData.icon" />
			<span v-else-if="metaData.text">{{ metaData.text }}</span>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
$-meta-font-size = 9px

.-frame
	position: relative

.-img
	width: 100%
	height: 100%
	object-fit: cover

.-meta
	position: absolute
	top: 0
	right: 0
	font-weight: bold
	color: var(--theme-link)
	text-shadow: 0 0 4px var(--theme-link)
	font-size: $-meta-font-size
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
		min-width: $font-size-base
		min-height: $font-size-base

.-icon
	&-sm
		font-size: $font-size-small

	&-base
		font-size: $font-size-base
</style>
