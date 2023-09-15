<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import AppScrollScroller from '../../../../_common/scroll/AppScrollScroller.vue';
import { TagInfo, TagsInfo } from '../tags-info.service';
import AppTagThumbnail from '../thumbnail/thumbnail.vue';

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

@Options({
	components: {
		AppScrollScroller,
		AppTagThumbnail,
	},
})
export default class AppTagList extends Vue {
	@Prop({ type: String, default: 'global' }) eventCat!: string;

	get tags() {
		const tags: TagInfo[] = [];
		for (const tag of FeaturedTags) {
			const info = TagsInfo.tags.find(i => i.id === tag);
			if (info) {
				tags.push(info);
			}
		}

		return tags;
	}
}
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
