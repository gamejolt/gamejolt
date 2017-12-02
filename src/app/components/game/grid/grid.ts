import View from '!view!./grid.html?style=./grid.styl';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { AppGameThumbnail } from '../../../../_common/game/thumbnail/thumbnail';
import { AppAd } from '../../../../lib/gj-lib-client/components/ad/ad';
import { Ads } from '../../../../lib/gj-lib-client/components/ad/ads.service';
import { AppTrackEvent } from '../../../../lib/gj-lib-client/components/analytics/track-event.directive.vue';
import { Game } from '../../../../lib/gj-lib-client/components/game/game.model';
import { AppPagination } from '../../../../lib/gj-lib-client/components/pagination/pagination';
import { Screen } from '../../../../lib/gj-lib-client/components/screen/screen-service';
import { Scroll } from '../../../../lib/gj-lib-client/components/scroll/scroll.service';
import { makeObservableService } from '../../../../lib/gj-lib-client/utils/vue';
import { number } from '../../../../lib/gj-lib-client/vue/filters/number';

export const GameGridRowSizeSm = 2;
export const GameGridRowSizeMd = 3;
export const GameGridRowSizeLg = 3;

let idCounter = 0;

@View
@Component({
	components: {
		AppGameThumbnail,
		AppPagination,
		AppAd,
	},
	directives: {
		AppTrackEvent,
	},
})
export class AppGameGrid extends Vue {
	@Prop({ type: Array, default: () => [] })
	games: Game[];
	@Prop(Number) gamesCount?: number;
	@Prop(Number) perPage?: number;
	@Prop(Boolean) truncateToFit?: boolean;
	@Prop(Boolean) scrollable?: boolean;
	@Prop(Boolean) showAds?: boolean;
	@Prop(String) eventLabel?: string;
	@Prop({ type: String, default: 'top' })
	adPos?: string;

	currentPage = 1;

	id = ++idCounter;

	number = number;
	Screen = makeObservableService(Screen);
	Scroll = Scroll;

	get shouldShowAds() {
		return this.showAds && Ads.shouldShow;
	}

	/**
	 * Depending on the screen size, we want to only show a certain number of
	 * games. This will trim the last few games off if it can't fit within the
	 * rows completely.
	 */
	get processedGames() {
		const games = this.games;

		if (!this.truncateToFit) {
			return games;
		}

		let rowSize = this.rowSize;
		let chunkSize = Math.max(1, Math.floor(games.length / rowSize)) * rowSize;

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
		if (!this.shouldShowAds) {
			return false;
		}

		const numGames = this.processedGames.length;
		const rowSize = this.rowSize;
		const remainder = numGames % rowSize;

		index = index + 1;
		if (Screen.isDesktop) {
			// Only show a trailing ad if there's more than 20 games shown in
			// the grid.
			if (numGames <= 20) {
				return false;
			}

			// Show an add if we're in the last row of games. Since it's desktop
			// display, this will pull it to the right of the row.
			if (numGames - index === remainder) {
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
			// Never show ads on XS when it's scrollable.
			if (this.scrollable) {
				return false;
			}

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
