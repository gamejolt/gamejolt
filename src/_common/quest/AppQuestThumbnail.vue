<script lang="ts" setup>
import { computed, PropType, toRefs } from 'vue';
import { styleOverlayTextShadow } from '../../_styles/mixins';
import { kFontSizeSmall } from '../../_styles/variables';
import AppImgResponsive from '../img/AppImgResponsive.vue';
import AppJolticon, { Jolticon } from '../jolticon/AppJolticon.vue';
import AppQuestFrame from './AppQuestFrame.vue';
import { Quest } from './quest-model';

const props = defineProps({
	quest: {
		type: Object as PropType<Quest>,
		required: true,
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
		return { icon: 'gift', bubble: true };
	} else if (q.isAllComplete) {
		return { icon: 'double-check', bubble: true };
	} else if (q.isComplete) {
		return { icon: 'check', bubble: true };
	} else if (q.is_new && !q.isExpired) {
		return { text: 'NEW!' };
	}
});
</script>

<template>
	<div class="_frame">
		<AppQuestFrame :active="isActive">
			<AppImgResponsive class="_img" :src="quest.avatar.mediaserver_url" alt="Quest Image" />
		</AppQuestFrame>

		<div v-if="metaData" class="_meta" :class="{ _bubble: metaData.bubble }">
			<AppJolticon
				v-if="metaData.icon"
				:style="{
					margin: 0,
					padding: 0,
					fontSize: kFontSizeSmall.px,
				}"
				:icon="metaData.icon"
			/>
			<div
				v-else-if="metaData.text"
				:style="{
					textShadow: `0 0 4px var(--theme-link), ${styleOverlayTextShadow.textShadow}`,
				}"
			>
				{{ metaData.text }}
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
$-meta-font-size = 9px

._frame
	position: relative

._img
	width: 100%
	height: 100%
	object-fit: cover

._meta
	position: absolute
	top: 0
	right: 0
	font-weight: bold
	color: var(--theme-link)
	font-size: $-meta-font-size
	z-index: 1

	&._bubble
		img-circle()
		elevate-1()
		color: var(--theme-bi-fg)
		background-color: var(--theme-bi-bg)
		padding: 3px
		display: flex
		align-items: center
		justify-content: center
		min-width: $font-size-base
		min-height: $font-size-base
</style>
