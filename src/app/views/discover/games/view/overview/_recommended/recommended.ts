import { Ads } from '../../../../../../../_common/ad/ads.service';
import AppAdPlaywireVideo from '../../../../../../../_common/ad/playwire/video.vue';
import AppAdWidget from '../../../../../../../_common/ad/widget/widget.vue';
import { Screen } from '../../../../../../../_common/screen/screen-service';
import AppScrollAffix from '../../../../../../../_common/scroll/affix/affix.vue';
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import AppGameGrid from '../../../../../../components/game/grid/grid.vue';
import AppGameGridPlaceholder from '../../../../../../components/game/grid/placeholder/placeholder.vue';
import AppGameList from '../../../../../../components/game/list/list.vue';
import AppGameListPlaceholder from '../../../../../../components/game/list/placeholder/placeholder.vue';
import { RouteStore, RouteStoreModule } from '../../view.store';

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
		return this.shouldShowAds && this.postsCount > 2 && Screen.isLg;
	}
}
