<script lang="ts">
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import {
	AdSettingsContainer,
	releasePageAdsSettings,
	setPageAdsSettings,
	useAdsController,
} from '../../../_common/ad/ad-store';
import AppAdWidget from '../../../_common/ad/widget/AppAdWidget.vue';
import { Api } from '../../../_common/api/api.service';
import { isDynamicGoogleBot } from '../../../_common/device/device.service';
import { GameBuildModel } from '../../../_common/game/build/build.model';
import { GameModel } from '../../../_common/game/game.model';
import { GameSongModel } from '../../../_common/game/song/song.model';
import AppGameThumbnail from '../../../_common/game/thumbnail/AppGameThumbnail.vue';
import { HistoryTick } from '../../../_common/history-tick/history-tick-service';
import AppLoading from '../../../_common/loading/AppLoading.vue';
import { setAppPromotionCohort, useAppPromotionStore } from '../../../_common/mobile-app/store';
import { Navigate } from '../../../_common/navigate/navigate.service';
import { buildPayloadErrorForStatusCode } from '../../../_common/payload/payload-service';
import {
	LegacyRouteComponent,
	OptionsForLegacyRoute,
} from '../../../_common/route/legacy-route-component';
import { Screen } from '../../../_common/screen/screen-service';
import AppScrollAffix from '../../../_common/scroll/AppScrollAffix.vue';
import { sleep } from '../../../utils/utils';
import { shallowSetup } from '../../../utils/vue';
import AppGameBadge from '../../components/game/badge/AppGameBadge.vue';
import AppPageContainer from '../../components/page-container/AppPageContainer.vue';

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
@OptionsForLegacyRoute({
	deps: { params: ['type'], query: ['game_id', 'build_id'] },
	async resolver({ route }) {
		const getQuery = (name: string) =>
			typeof route.query[name] != 'string' || !route.query[name]
				? null
				: parseInt(route.query[name] as string);

		const gameId = getQuery('game');
		if (!gameId) {
			return buildPayloadErrorForStatusCode(404);
		}

		const query: string[] = [];
		if (route.params.type === 'build') {
			const buildId = getQuery('build');
			if (!buildId) {
				return buildPayloadErrorForStatusCode(404);
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
export default class RouteDownload extends LegacyRouteComponent {
	ads = setup(() => useAdsController());
	appPromotionStore = shallowSetup(() => useAppPromotionStore());

	started = false;
	game: GameModel = null as any;
	build: null | GameBuildModel = null;
	ownerGames: GameModel[] = [];
	recommendedGames: GameModel[] = [];

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
				? this.$gettext(`Downloading %{ game }`, {
						game: this.game.title,
				  })
				: this.$gettext(`Downloading soundtrack for %{ game }`, {
						game: this.game.title,
				  });
		}
		return null;
	}

	routeCreated() {
		setAppPromotionCohort(this.appPromotionStore, 'store');
	}

	async routeResolved($payload: any) {
		this.game = new GameModel($payload.game);
		this.build = $payload.build ? new GameBuildModel($payload.build) : null;
		this.started = false;

		this.ownerGames = GameModel.populate($payload.ownerGames);
		this.recommendedGames = GameModel.populate($payload.recommendedGames);
		this._setAdSettings();

		// Don't download on SSR.
		if (import.meta.env.SSR || isDynamicGoogleBot()) {
			return;
		}

		// We do it like this so that we start getting the download URL right
		// away while still waiting for the timeout.
		const [data] = await Promise.all<any>([
			this.type === 'build'
				? this.build!.getDownloadUrl({
						forceDownload: true,
				  })
				: GameSongModel.getSoundtrackDownloadUrl(this.game.id),

			// Wait at least this long before spawning the download.
			sleep(DownloadDelay),
		]);

		this.started = true;

		// While developing we often don't want to be downloading files every time the page reloads.
		if (GJ_ENVIRONMENT === 'production' && GJ_BUILD_TYPE === 'build') {
			if (GJ_IS_DESKTOP_APP) {
				Navigate.gotoExternal(data.url);
			} else {
				Navigate.goto(data.url);
			}
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

		setPageAdsSettings(this.ads, settings);
	}

	private _releaseAdSettings() {
		releasePageAdsSettings(this.ads);
	}
}
</script>

<template>
	<section v-if="isRouteBootstrapped" class="-section section">
		<AppAdWidget
			v-if="!Screen.isMobile"
			class="-leaderboard-ad"
			size="leaderboard"
			placement="top"
		/>

		<AppPageContainer xl>
			<template v-if="Screen.isDesktop" #left>
				<AppScrollAffix>
					<AppAdWidget size="rectangle" placement="side" />
				</AppScrollAffix>
			</template>
			<template v-if="Screen.isLg" #right>
				<AppScrollAffix>
					<AppAdWidget size="rectangle" placement="side" />
				</AppScrollAffix>
			</template>
			<template #default>
				<AppGameBadge :game="game" full-bleed />

				<h2 class="section-header">
					<template v-if="type === 'build'">
						<AppTranslate :translate-params="{ game: game.title }">
							Downloading %{ game }...
						</AppTranslate>
					</template>
					<template v-else-if="type === 'soundtrack'">
						<AppTranslate :translate-params="{ game: game.title }">
							Downloading soundtrack for %{ game }...
						</AppTranslate>
					</template>
				</h2>

				<p class="small text-muted">
					<AppTranslate> Your download will begin in just a moment... </AppTranslate>
				</p>

				<!--
				Set visibility so that the page height doesn't change when we
				hide. We don't want to change if they're trying to click
				something.
				-->
				<div :style="{ visibility: started ? 'hidden' : undefined }">
					<AppLoading :hide-label="true" />
					<br />
				</div>

				<AppAdWidget size="video" placement="content" />

				<h2>
					<AppTranslate>You May Also Like</AppTranslate>
				</h2>

				<div class="scrollable-grid-xs">
					<div class="row">
						<div
							v-for="game of games"
							:key="game.id"
							class="scrollable-grid-item col-xs-10 col-sm-6"
						>
							<AppGameThumbnail
								v-app-track-event="'recommended-games:click:download'"
								:game="game"
							/>
						</div>
					</div>
				</div>
			</template>
		</AppPageContainer>
	</section>
</template>

<style lang="stylus" scoped>
// We want to keep the top part as thin as possible.
.-section
	padding-top: $line-height-computed

.-leaderboard-ad
	margin-bottom: $line-height-computed * 2
</style>
