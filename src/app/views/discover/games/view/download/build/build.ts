import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import AppAdPlacement from '../../../../../../../_common/ad/placement/placement.vue';
import AppAdPlaywireVideo from '../../../../../../../_common/ad/playwire/video.vue';
import AppAdWidget from '../../../../../../../_common/ad/widget/widget.vue';
import { Api } from '../../../../../../../_common/api/api.service';
import { Environment } from '../../../../../../../_common/environment/environment.service';
import { GameBuild } from '../../../../../../../_common/game/build/build.model';
import { Game } from '../../../../../../../_common/game/game.model';
import AppGameThumbnail from '../../../../../../../_common/game/thumbnail/thumbnail.vue';
import { HistoryTick } from '../../../../../../../_common/history-tick/history-tick-service';
import AppLoading from '../../../../../../../_common/loading/loading.vue';
import { BaseRouteComponent, RouteResolver } from '../../../../../../../_common/route/route-component';
import { Screen } from '../../../../../../../_common/screen/screen-service';
import { Scroll } from '../../../../../../../_common/scroll/scroll.service';
import { AppSocialFacebookLike } from '../../../../../../../_common/social/facebook/like/like';
import { AppSocialTwitterShare } from '../../../../../../../_common/social/twitter/share/share';
import { Store } from '../../../../../../store/index';
import AppGameOgrs from '../../../../../game/ogrs/ogrs.vue';
import AppRatingWidget from '../../../../../rating/widget/widget.vue';
import AppDiscoverGamesViewOverviewDetails from '../../overview/_details/details.vue';
import { RouteStore, RouteStoreModule } from '../../view.store';

const DownloadDelay = 3000;

@Component({
	name: 'RouteDiscoverGamesViewDownloadBuild',
	components: {
		AppAdWidget,
		AppAdPlacement,
		AppGameThumbnail,
		AppRatingWidget,
		AppSocialFacebookLike,
		AppSocialTwitterShare,
		AppLoading,
		AppGameOgrs,
		AppDiscoverGamesViewOverviewDetails,
		AppAdPlaywireVideo,
	},
})
@RouteResolver({
	deps: { params: ['buildId'] },
	resolver({ route }) {
		const gameId = parseInt(route.params.id, 10);
		const buildId = parseInt(route.params.buildId, 10);

		HistoryTick.sendBeacon('game-build', buildId, {
			sourceResource: 'Game',
			sourceResourceId: gameId,
		});

		return Api.sendRequest(`/web/discover/games/builds/download-page/${gameId}/${buildId}`);
	},
})
export default class RouteDiscoverGamesViewDownloadBuild extends BaseRouteComponent {
	@RouteStoreModule.State
	game!: RouteStore['game'];

	@RouteStoreModule.State
	userRating!: RouteStore['userRating'];

	@State
	app!: Store['app'];

	src: string | null = null;
	build: GameBuild = null as any;
	developerGames: Game[] = [];
	recommendedGames: Game[] = [];
	twitterShareMessage = '';

	readonly Screen = Screen;
	readonly Environment = Environment;

	get routeTitle() {
		if (this.game) {
			return this.$gettextInterpolate(`Downloading %{ game }`, {
				game: this.game.title,
			});
		}
		return null;
	}

	async routeResolved($payload: any) {
		this.build = new GameBuild($payload.build);
		this.src = null;

		this.developerGames = Game.populate($payload.developerGames);
		this.recommendedGames = Game.populate($payload.recommendedGames);
		this.twitterShareMessage = $payload.twitterShareMessage;

		// Don't download on SSR.
		if (GJ_IS_SSR) {
			return;
		}

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
