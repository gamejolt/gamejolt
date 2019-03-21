import AppAdPlacement from 'game-jolt-frontend-lib/components/ad/placement/placement.vue';
import AppAdWidget from 'game-jolt-frontend-lib/components/ad/widget/widget.vue';
import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import { Environment } from 'game-jolt-frontend-lib/components/environment/environment.service';
import { GameBuild } from 'game-jolt-frontend-lib/components/game/build/build.model';
import { Game } from 'game-jolt-frontend-lib/components/game/game.model';
import { HistoryTick } from 'game-jolt-frontend-lib/components/history-tick/history-tick-service';
import {
	BaseRouteComponent,
	RouteResolver,
} from 'game-jolt-frontend-lib/components/route/route-component';
import { Screen } from 'game-jolt-frontend-lib/components/screen/screen-service';
import { Scroll } from 'game-jolt-frontend-lib/components/scroll/scroll.service';
import { AppSocialFacebookLike } from 'game-jolt-frontend-lib/components/social/facebook/like/like';
import { AppSocialTwitterShare } from 'game-jolt-frontend-lib/components/social/twitter/share/share';
import AppLoading from 'game-jolt-frontend-lib/vue/components/loading/loading.vue';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import AppGameThumbnail from '../../../../../../../_common/game/thumbnail/thumbnail.vue';
import AppGameOgrs from '../../../../../../components/game/ogrs/ogrs.vue';
import AppRatingWidget from '../../../../../../components/rating/widget/widget.vue';
import { Store } from '../../../../../../store/index';
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
