import { GameTrophy } from 'game-jolt-frontend-lib/components/game/trophy/trophy.model';
import { AppTimeAgo } from 'game-jolt-frontend-lib/components/time/ago/ago';
import { AppTooltip } from 'game-jolt-frontend-lib/components/tooltip/tooltip';
import { UserGameTrophy } from 'game-jolt-frontend-lib/components/user/trophy/game-trophy.model';
import AppJolticon from 'game-jolt-frontend-lib/vue/components/jolticon/jolticon.vue';
import { number } from 'game-jolt-frontend-lib/vue/filters/number';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import AppTrophyThumbnail from '../thumbnail/thumbnail.vue';

@Component({
	components: {
		AppJolticon,
		AppTrophyThumbnail,
		AppTimeAgo,
	},
	directives: {
		AppTooltip,
	},
	filters: {
		number,
	},
})
export default class AppTrophyList extends Vue {
	@Prop(Array) trophies!: GameTrophy[];
	@Prop(Array) achieved!: UserGameTrophy[];

	get achievedIndexed() {
		return UserGameTrophy.indexAchieved(this.achieved);
	}
}
