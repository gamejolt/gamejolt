import { setup } from 'vue-class-component';
import { Options, Prop, Vue } from 'vue-property-decorator';
import { propOptional } from '../../../../utils/vue';
import { useAdsController } from '../../../../_common/ad/ad-store';
import AppAdWidget from '../../../../_common/ad/widget/widget.vue';
import { AppCondenseWhitespace } from '../../../../_common/condense-whitespace';
import { number } from '../../../../_common/filters/number';
import { Game } from '../../../../_common/game/game.model';
import AppGameThumbnail from '../../../../_common/game/thumbnail/thumbnail.vue';
import { Screen } from '../../../../_common/screen/screen-service';

export const GameGridRowSizeSm = 2;
export const GameGridRowSizeMd = 3;
export const GameGridRowSizeLg = 3;

let idCounter = 0;

@Options({
	components: {
		AppGameThumbnail,
		AppAdWidget,
		AppCondenseWhitespace,
	},
})
export default class AppGameGrid extends Vue {
	@Prop(propOptional(Array, () => [])) games!: Game[];
	@Prop(propOptional(Number, 0)) gamesCount!: number;
	@Prop(propOptional(Number, 0)) currentPage!: number;
	@Prop(propOptional(Boolean, false)) truncateToFit!: boolean;
	@Prop(propOptional(Boolean, false)) scrollable!: boolean;
	@Prop(propOptional(Boolean, false)) forceScrollable!: boolean;
	@Prop(propOptional(Boolean, false)) showAds!: boolean;
	@Prop(propOptional(String)) eventLabel?: string;

	ads = setup(() => useAdsController());

	id = ++idCounter;

	readonly number = number;
	readonly Screen = Screen;

	get shouldShowAds() {
		return this.showAds && this.ads.shouldShow;
	}

	get isScrollable() {
		return (Screen.isXs && this.scrollable) || this.forceScrollable;
	}

	/**
	 * Depending on the screen size, we want to only show a certain number of
	 * games. This will trim the last few games off if it can't fit within the
	 * rows completely.
	 */
	get processedGames() {
		const games = this.games;

		if (!this.truncateToFit || this.isScrollable) {
			return games;
		}

		let chunkSize = Math.max(1, Math.floor(games.length / this.rowSize)) * this.rowSize;

		// Subtract one for the ad slot.
		if (Screen.isDesktop && this.shouldShowAds) {
			chunkSize -= 1;
		}

		return games.slice(0, chunkSize);
	}

	get rowSize() {
		if (Screen.isSm) {
			return GameGridRowSizeSm;
		} else if (Screen.isMd) {
			return GameGridRowSizeMd;
		} else if (Screen.isLg) {
			return GameGridRowSizeLg;
		}

		return this.games.length;
	}

	shouldShowAd(index: number) {
		if (!this.shouldShowAds || this.isScrollable) {
			return false;
		}

		const numGames = this.processedGames.length;

		index = index + 1;
		if (Screen.isDesktop) {
			// Show every X games. This index will set it to be the the third
			// placement in the row which looks pretty good.
			if (index % 13 === 0) {
				return true;
			}
		} else if (Screen.isSm) {
			// Show after the first 4 games, but only if 6 or more will show
			// after the ad.
			if (index === 5 && numGames - index >= 6) {
				return true;
			} else if (index > 5 && (index - 5) % 10 === 0 && numGames - index >= 6) {
				// Show every 10 games after the first 4, but only if 6 or more will
				// show after the ad.
				return true;
			}
		} else if (Screen.isXs) {
			// Show after the first 2 games, but only if 6 or more will show
			// after the ad.
			if (index === 3 && numGames - index >= 6) {
				return true;
			} else if (index > 3 && (index - 3) % 8 === 0 && numGames - index >= 6) {
				// Show every 8 games after the first 2, but only if 6 or more will
				// show after the ad.
				return true;
			}
		}

		return false;
	}
}
