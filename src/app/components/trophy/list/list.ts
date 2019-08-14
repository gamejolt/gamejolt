import { GameTrophy } from '../../../../_common/game/trophy/trophy.model';
import { AppTimeAgo } from '../../../../_common/time/ago/ago';
import { AppTooltip } from '../../../../_common/tooltip/tooltip';
import { UserGameTrophy } from '../../../../_common/user/game-trophy/game-trophy.model';
import AppJolticon from '../../../../_common/jolticon/jolticon.vue';
import { number } from '../../../../_common/filters/number';
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
