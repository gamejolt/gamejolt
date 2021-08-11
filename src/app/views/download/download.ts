import { Inject, Options } from 'vue-property-decorator';
import {
	AppPromotionStore,
	AppPromotionStoreKey,
	setAppPromotionCohort,
} from '../../../utils/mobile-app';
import { sleep } from '../../../utils/utils';
import { AdSettingsContainer } from '../../../_common/ad/ad-store';
import AppAdWidget from '../../../_common/ad/widget/widget.vue';
import { Api } from '../../../_common/api/api.service';
import { GameBuild } from '../../../_common/game/build/build.model';
import { Game } from '../../../_common/game/game.model';
import { GameSong } from '../../../_common/game/song/song.model';
import AppGameThumbnail from '../../../_common/game/thumbnail/thumbnail.vue';
import { HistoryTick } from '../../../_common/history-tick/history-tick-service';
import AppLoading from '../../../_common/loading/loading.vue';
import { Navigate } from '../../../_common/navigate/navigate.service';
import { PayloadError } from '../../../_common/payload/payload-service';
import { BaseRouteComponent, RouteResolver } from '../../../_common/route/route-component';
import { Screen } from '../../../_common/screen/screen-service';
import AppScrollAffix from '../../../_common/scroll/affix/affix.vue';
import AppGameBadge from '../../components/game/badge/badge.vue';
import AppPageContainer from '../../components/page-container/page-container.vue';

const DownloadDelay = 3000;

@Options({
	name: 'RouteDownload',
	components: {
		AppPageContainer,
		AppGameBadge,
		AppAdWidget,
		AppGameThumbnail,
		AppLoading,
		AppScrollAffix,
	},
})
@RouteResolver({
	deps: { params: ['type'], query: ['game_id', 'build_id'] },
	async resolver({ route }) {
		const getQuery = (name: string) =>
			typeof route.query[name] != 'string' || !route.query[name]
				? null
				: parseInt(route.query[name] as string);

		const gameId = getQuery('game');
		if (!gameId) {
			return PayloadError.fromHttpError(404);
		}

		const query: string[] = [];
		if (route.params.type === 'build') {
			const buildId = getQuery('build');
			if (!buildId) {
				return PayloadError.fromHttpError(404);
			}

			HistoryTick.sendBeacon('game-build', buildId, {
				sourceResource: 'Game',
				sourceResourceId: gameId,
			});

			query.push(`build=${buildId}`);
		}

		return Api.sendRequest(`/web/download/info/${gameId}?${query.join('&')}`);
	},
})
export default class RouteDownload extends BaseRouteComponent {
	@Inject({ from: AppPromotionStoreKey })
	appPromotion!: AppPromotionStore;

	started = false;
	game: Game = null as any;
	build: null | GameBuild = null;
	ownerGames: Game[] = [];
	recommendedGames: Game[] = [];

	readonly Screen = Screen;

	get type() {
		return this.$route.params['type'] as 'build' | 'soundtrack';
	}

	get games() {
		// Put the first two games as the dev's games, and then fill the rest
		// with recommended.
		return [...this.ownerGames.slice(0, 2), ...this.recommendedGames].slice(0, 6);
	}

	get routeTitle() {
		if (this.game) {
			return this.type === 'build'
				? this.$gettextInterpolate(`Downloading %{ game }`, {
						game: this.game.title,
				  })
				: this.$gettextInterpolate(`Downloading soundtrack for %{ game }`, {
						game: this.game.title,
				  });
		}
		return null;
	}

	routeCreated() {
		setAppPromotionCohort(this.appPromotion, 'store');
	}

	async routeResolved($payload: any) {
		this.game = new Game($payload.game);
		this.build = $payload.build ? new GameBuild($payload.build) : null;
		this.started = false;

		this.ownerGames = Game.populate($payload.ownerGames);
		this.recommendedGames = Game.populate($payload.recommendedGames);
		this._setAdSettings();

		// Don't download on SSR.
		if (GJ_IS_SSR) {
			return;
		}

		// We do it like this so that we start getting the download URL right
		// away while still waiting for the timeout.
		const [data] = await Promise.all<any>([
			this.type === 'build'
				? this.build!.getDownloadUrl({
						forceDownload: true,
				  })
				: GameSong.getSoundtrackDownloadUrl(this.game.id),

			// Wait at least this long before spawning the download.
			sleep(DownloadDelay),
		]);

		this.started = true;
		if (GJ_BUILD_TYPE === 'production') {
			Navigate.goto(data.url);
		}
	}

	routeDestroyed() {
		this._releaseAdSettings();
	}

	private _setAdSettings() {
		if (!this.game) {
			return;
		}

		const settings = new AdSettingsContainer();
		settings.resource = this.game;
		settings.isPageDisabled =
			this.game.has_adult_content || this.game.isOwned || this.game.is_paid_game;

		this.$ad.setPageSettings(settings);
	}

	private _releaseAdSettings() {
		this.$ad.releasePageSettings();
	}
}
