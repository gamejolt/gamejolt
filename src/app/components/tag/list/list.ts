import AppScrollScroller from 'game-jolt-frontend-lib/components/scroll/scroller/scroller.vue'
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { TagsInfo } from '../tags-info.service';
import AppTagThumbnail from '../thumbnail/thumbnail.vue'

const FeaturedTags = [
	'action',
	'horror',
	'adventure',
	'fangame',
	'fnaf',
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
	get tags() {
		const tags = [];
		for (const tag of FeaturedTags) {
			const info = TagsInfo.tags.find(i => i.id === tag);
			if (info) {
				tags.push(info);
			}
		}

		return tags;
	}
}
