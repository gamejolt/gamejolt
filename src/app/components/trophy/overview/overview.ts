import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import * as View from '!view!./overview.html?style=./overview.styl';

import { Game } from '../../../../lib/gj-lib-client/components/game/game.model';
import { State } from 'vuex-class';
import { Screen } from '../../../../lib/gj-lib-client/components/screen/screen-service';
import { makeObservableService } from '../../../../lib/gj-lib-client/utils/vue';
import { UserGameTrophy } from '../../../../lib/gj-lib-client/components/user/game-trophy/game-trophy.model';
import { GameTrophy } from '../../../../lib/gj-lib-client/components/game/trophy/trophy.model';
import { number } from '../../../../lib/gj-lib-client/vue/filters/number';
import { AppTrophyCompletion } from '../completion/completion';
import { AppTrophyThumbnail } from '../thumbnail/thumbnail';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { Store } from '../../../store/index';

@View
@Component({
	components: {
		AppTrophyCompletion,
		AppTrophyThumbnail,
		AppJolticon,
	},
	filters: {
		number,
	},
})
export class AppTrophyOverview extends Vue {
	@Prop(Game) game: Game;
	@Prop(Object) initialPayload?: any;
	@Prop({ type: String, default: 'full' })
	size?: 'small' | 'full';

	@State app: Store['app'];

	trophies: GameTrophy[] = [];
	showInvisibleTrophyMessage = false;
	experience = 0;

	achieved: UserGameTrophy[] = [];
	achievedIndexed: any = {};

	Screen = makeObservableService(Screen);
	number = number;

	get desktopThumbSizes() {
		if (this.size === 'full') {
			// If the user is logged in, we will show their completion widget on
			// the right for LG screens. In that case we show larger LG thumbs.
			if (this.app.user) {
				return 'col-md-2 col-lg-2';
			}

			// Otherwise it stretches across the full view and we show smaller.
			return 'col-md-2 col-lg-1';
		}

		return 'col-md-3 col-lg-3';
	}

	get numberToShow() {
		if (Screen.isXs) {
			return 6;
		}

		if (this.size === 'full') {
			if (Screen.isLg) {
				if (this.app.user) {
					return 12;
				}
				return 24;
			}
			return 12;
		}

		if (Screen.isDesktop) {
			return 16;
		}

		return 12;
	}

	get extraCount() {
		return Math.max(0, this.trophies.length - this.numberToShow);
	}

	created() {
		if (this.initialPayload) {
			this.processPayload(this.initialPayload);
		}
	}

	@Watch('initialPayload')
	onChange() {
		if (this.initialPayload) {
			this.processPayload(this.initialPayload);
		}
	}

	private processPayload(payload: any) {
		this.trophies = GameTrophy.populate(payload.trophies);
		this.showInvisibleTrophyMessage =
			payload.trophiesShowInvisibleTrophyMessage || false;
		this.experience = payload.trophiesExperienceAchieved || 0;

		this.achieved = payload.trophiesAchieved
			? UserGameTrophy.populate(payload.trophiesAchieved)
			: [];
		this.achievedIndexed = UserGameTrophy.indexAchieved(this.achieved);
	}
}
