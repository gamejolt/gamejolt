import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./list.html?style=./list.styl';

import { GameTrophy } from '../../../../lib/gj-lib-client/components/game/trophy/trophy.model';
import { UserGameTrophy } from '../../../../lib/gj-lib-client/components/user/game-trophy/game-trophy.model';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppTrophyThumbnail } from '../thumbnail/thumbnail';
import { AppTimeAgo } from '../../../../lib/gj-lib-client/components/time/ago/ago';
import { AppTooltip } from '../../../../lib/gj-lib-client/components/tooltip/tooltip';
import { number } from '../../../../lib/gj-lib-client/vue/filters/number';

@View
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
export class AppTrophyList extends Vue {
	@Prop(Array) trophies!: GameTrophy[];
	@Prop(Array) achieved!: UserGameTrophy[];

	get achievedIndexed() {
		return UserGameTrophy.indexAchieved(this.achieved);
	}
}
