import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { propOptional } from '../../../../utils/vue';
import AppScrollScroller from '../../../../_common/scroll/scroller/scroller.vue';
import { TagInfo, TagsInfo } from '../tags-info.service';
import AppTagThumbnail from '../thumbnail/thumbnail.vue';

const FeaturedTags = [
	'action',
	'horror',
	'adventure',
	'fangame',
	'fnaf',
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

@Component({
	components: {
		AppScrollScroller,
		AppTagThumbnail,
	},
})
export default class AppTagList extends Vue {
	@Prop(propOptional(String, 'global')) eventCat!: string;

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
