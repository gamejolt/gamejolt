import Vue from 'vue';
import VueRouter from 'vue-router';
import { State } from 'vuex-class';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./build.html';

import { RouteResolve } from '../../../../../../../lib/gj-lib-client/utils/router';
import { HistoryTick } from '../../../../../../../lib/gj-lib-client/components/history-tick/history-tick-service';
import { Api } from '../../../../../../../lib/gj-lib-client/components/api/api.service';
import { Game } from '../../../../../../../lib/gj-lib-client/components/game/game.model';
import { GameBuild } from '../../../../../../../lib/gj-lib-client/components/game/build/build.model';
import { Scroll } from '../../../../../../../lib/gj-lib-client/components/scroll/scroll.service';
import { makeObservableService } from '../../../../../../../lib/gj-lib-client/utils/vue';
import { Screen } from '../../../../../../../lib/gj-lib-client/components/screen/screen-service';
import { AppAd } from '../../../../../../../lib/gj-lib-client/components/ad/ad';
import { AppGameThumbnail } from '../../../../../../components/game/thumbnail/thumbnail';
import { AppSocialFacebookLike } from '../../../../../../../lib/gj-lib-client/components/social/facebook/like/like';
import { AppSocialTwitterShare } from '../../../../../../../lib/gj-lib-client/components/social/twitter/share/share';
import { AppRatingWidget } from '../../../../../../components/rating/widget/widget';
import { Environment } from '../../../../../../../lib/gj-lib-client/components/environment/environment.service';
import { AppLoading } from '../../../../../../../lib/gj-lib-client/vue/components/loading/loading';
import { RouteState, RouteStore } from '../../view.state';
import { Meta } from '../../../../../../../lib/gj-lib-client/components/meta/meta-service';
import { Store } from '../../../../../../store/index';
import { AppAdPlacement } from '../../../../../../../lib/gj-lib-client/components/ad/placement/placement';
import { AppDiscoverGamesViewOverviewDetails } from '../../overview/_details/details';
import { AppGameOgrs } from '../../../../../../components/game/ogrs/ogrs';

const DownloadDelay = 5000;

@View
@Component({
	components: {
		AppAd,
		AppAdPlacement,
		AppGameThumbnail,
		AppRatingWidget,
		AppSocialFacebookLike,
		AppSocialTwitterShare,
		AppLoading,
		AppGameOgrs,
		AppDiscoverGamesViewOverviewDetails,
	},
})
export default class RouteDiscoverGamesViewDownloadBuild extends Vue {
	@RouteState game: RouteStore['game'];
	@RouteState userRating: RouteStore['userRating'];

	@State app: Store['app'];

	src: string | null = null;
	build: GameBuild = null as any;
	developerGames: Game[] = [];
	recommendedGames: Game[] = [];

	Screen = makeObservableService(Screen);
	Environment = Environment;

	@RouteResolve()
	beforeRoute(this: undefined, route: VueRouter.Route) {
		const gameId = parseInt(route.params.id, 10);
		const buildId = parseInt(route.params.buildId, 10);

		HistoryTick.sendBeacon('game-build', buildId, {
			sourceResource: 'Game',
			sourceResourceId: gameId,
		});

		return Api.sendRequest(`/web/discover/games/builds/download-page/${gameId}/${buildId}`);
	}

	async routed() {
		Meta.title = this.$gettextInterpolate(`Downloading %{ game }`, {
			game: this.game.title,
		});

		this.build = new GameBuild(this.$payload.build);
		this.src = null;

		this.developerGames = Game.populate(this.$payload.developerGames);
		this.recommendedGames = Game.populate(this.$payload.recommendedGames);

		// Wait for view so we can scroll.
		await this.$nextTick();

		// Scroll down past the header.
		Scroll.to('page-ad-scroll');

		// We do it like this so that we start getting the download URL right
		// away while still waiting for the timeout.
		const data = await Promise.all<any>([
			this.build.getDownloadUrl({
				forceDownload: true,
			}),

			// Wait at least this long before spawning the download.
			this.timeout(),
		]);

		this.src = data[0].downloadUrl;
	}

	private async timeout() {
		return new Promise(resolve => {
			setTimeout(resolve, DownloadDelay);
		});
	}
}
