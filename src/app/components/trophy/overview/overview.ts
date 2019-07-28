import { Game } from 'game-jolt-frontend-lib/components/game/game.model';
import { GameTrophy } from 'game-jolt-frontend-lib/components/game/trophy/trophy.model';
import { Screen } from 'game-jolt-frontend-lib/components/screen/screen-service';
import { UserGameTrophy } from 'game-jolt-frontend-lib/components/user/trophy/game-trophy.model';
import AppJolticon from 'game-jolt-frontend-lib/vue/components/jolticon/jolticon.vue';
import { number } from 'game-jolt-frontend-lib/vue/filters/number';
import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { Store } from '../../../store/index';
import AppTrophyCompletion from '../completion/completion.vue';
import AppTrophyThumbnail from '../thumbnail/thumbnail.vue';

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
export default class AppTrophyOverview extends Vue {
	@Prop(Game) game!: Game;
	@Prop(Object) initialPayload?: any;
	@Prop({ type: String, default: 'full' })
	size?: 'small' | 'full';

	@State app!: Store['app'];

	trophies: GameTrophy[] = [];
	showInvisibleTrophyMessage = false;
	experience = 0;

	achieved: UserGameTrophy[] = [];
	achievedIndexed: any = {};

	readonly Screen = Screen;
	readonly number = number;

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
		this.showInvisibleTrophyMessage = payload.trophiesShowInvisibleTrophyMessage || false;
		this.experience = payload.trophiesExperienceAchieved || 0;

		this.achieved = payload.trophiesAchieved
			? UserGameTrophy.populate(payload.trophiesAchieved)
			: [];
		this.achievedIndexed = UserGameTrophy.indexAchieved(this.achieved);
	}
}
