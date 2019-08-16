import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { AppTrackEvent } from '../../../../_common/analytics/track-event.directive';
import AppScrollScroller from '../../../../_common/scroll/scroller/scroller.vue';
import { TagInfo, TagsInfo } from '../tags-info.service';
import AppTagThumbnail from '../thumbnail/thumbnail.vue';

const FeaturedTags = [
	'action',
	'horror',
	'adventure',
	'fangame',
	'fnaf',
	'rpg',
	'other',
	'multiplayer',
	'adult',
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
	directives: {
		AppTrackEvent,
	},
})
export default class AppTagList extends Vue {
	@Prop({ type: String, required: false, default: 'global' })
	eventCat!: string;

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
