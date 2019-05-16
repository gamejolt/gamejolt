import { Ads } from 'game-jolt-frontend-lib/components/ad/ads.service';
import AppAdPlaywireVideo from 'game-jolt-frontend-lib/components/ad/playwire/video.vue';
import AppAdWidget from 'game-jolt-frontend-lib/components/ad/widget/widget.vue';
import { Screen } from 'game-jolt-frontend-lib/components/screen/screen-service';
import AppScrollAffix from 'game-jolt-frontend-lib/components/scroll/affix/affix.vue';
import { User } from 'game-jolt-frontend-lib/components/user/user.model';
import { AppStore } from 'game-jolt-frontend-lib/vue/services/app/app-store';
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import AppGameGrid from '../../../../../../components/game/grid/grid.vue';
import AppGameGridPlaceholder from '../../../../../../components/game/grid/placeholder/placeholder.vue';
import AppGameList from '../../../../../../components/game/list/list.vue';
import AppGameListPlaceholder from '../../../../../../components/game/list/placeholder/placeholder.vue';
import { RouteStore, RouteStoreModule } from '../../view.store';

/** Number of games to show before inserting an ad. */
const SplitIndex = 3;

@Component({
	components: {
		AppGameGridPlaceholder,
		AppGameGrid,
		AppGameListPlaceholder,
		AppGameList,
		AppAdWidget,
		AppScrollAffix,
		AppAdPlaywireVideo,
	},
})
export default class AppDiscoverGamesViewOverviewRecommended extends Vue {
	@RouteStoreModule.State
	recommendedGames!: RouteStore['recommendedGames'];

	@RouteStoreModule.State
	postsCount!: RouteStore['postsCount'];

	@State
	app!: AppStore;

	readonly Screen = Screen;

	get isLoaded() {
		return this.recommendedGames.length > 0;
	}

	get shouldShowAds() {
		return Ads.shouldShow;
	}

	get shouldShowBottomAd() {
		// We only want to show the bottom ad if there is enough room on the
		// page.
		return this.postsCount > 2 && Screen.isLg;
	}

	get shouldShowVideoAd() {
		return !(this.app.user instanceof User);
	}

	get gamesBeforeAd() {
		return this.recommendedGames.slice(0, SplitIndex);
	}

	get gamesAfterAd() {
		return Screen.isLg ? this.recommendedGames.slice(SplitIndex) : [];
	}
}
