import View from '!view!./recommended.html';
import { AppAdWidget } from 'game-jolt-frontend-lib/components/ad/widget/widget';
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { Screen } from '../../../../../../../lib/gj-lib-client/components/screen/screen-service';
import { AppGameGrid } from '../../../../../../components/game/grid/grid';
import { AppGameGridPlaceholder } from '../../../../../../components/game/grid/placeholder/placeholder';
import { AppGameList } from '../../../../../../components/game/list/list';
import { AppGameListPlaceholder } from '../../../../../../components/game/list/placeholder/placeholder';
import { RouteStore, RouteStoreModule } from '../../view.store';

/** Number of games to show before inserting an ad. */
const SplitIndex = 3;

@View
@Component({
	components: {
		AppGameGridPlaceholder,
		AppGameGrid,
		AppGameListPlaceholder,
		AppGameList,
		AppAdWidget,
	},
})
export class AppDiscoverGamesViewOverviewRecommended extends Vue {
	@RouteStoreModule.State
	recommendedGames!: RouteStore['recommendedGames'];

	@RouteStoreModule.State
	postsCount!: RouteStore['postsCount'];

	readonly Screen = Screen;

	get isLoaded() {
		return this.recommendedGames.length > 0;
	}

	get shouldShowBottomAd() {
		// We only want to show the bottom ad if there is enough room on the
		// page.
		return this.postsCount > 4 && Screen.isLg;
	}

	get gamesBeforeAd() {
		return this.recommendedGames.slice(0, SplitIndex);
	}

	get gamesAfterAd() {
		return Screen.isLg ? this.recommendedGames.slice(SplitIndex) : [];
	}
}
