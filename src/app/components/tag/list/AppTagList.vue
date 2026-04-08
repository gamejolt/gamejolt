<script lang="ts" setup>
import { computed } from 'vue';

import AppScrollScroller from '../../../../_common/scroll/AppScrollScroller.vue';
import { TagInfo, TagsInfo } from '../tags-info.service';
import AppTagThumbnail from '../thumbnail/AppTagThumbnail.vue';

const FeaturedTags = [
	'action',
	'horror',
	'adventure',
	'fangame',
	'fnaf',
	'undertale',
	'bendy',
	'fnf',
	'rpg',
	'other',
	'multiplayer',
	'platformer',
	'scifi',
	'retro',
	'pointnclick',
	'shooter',
	'altgame',
	'vr',
	'survival',
	'arcade',
	'roguelike',
	'puzzle',
	'strategy',
	'sports',
];

type Props = {
	eventCat?: string;
};

const { eventCat = 'global' } = defineProps<Props>();

const tags = computed(() => {
	const result: TagInfo[] = [];
	for (const tag of FeaturedTags) {
		const info = TagsInfo.tags.find(i => i.id === tag);
		if (info) {
			result.push(info);
		}
	}

	return result;
});
</script>

<template>
	<AppScrollScroller horizontal>
		<div class="-list">
			<div v-for="tag of tags" :key="tag.id" class="-list-item">
				<AppTagThumbnail class="-list-thumb" :tag="tag.id" :event-cat="eventCat" />
			</div>
		</div>
	</AppScrollScroller>
</template>

<style lang="stylus" scoped>
.-list
	white-space: nowrap
	text-align: center
	padding-top: ($grid-gutter-width / 2)
	padding-bottom: ($grid-gutter-width / 2)

	@media $media-xs
		padding-top: ($grid-gutter-width-xs / 2)
		padding-bottom: ($grid-gutter-width-xs / 2)

	&-item
		display: inline-block
		width: 130px
		margin: 0 10px

	&-thumb
		margin-bottom: 0 !important
</style>
