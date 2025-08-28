<script lang="ts" setup>
import { computed, ref, toRef } from 'vue';
import { useRoute } from 'vue-router';
import AppAdTakeoverBackground from '../../../_common/ad/AppAdTakeoverBackground.vue';
import AppAdTakeoverFloat from '../../../_common/ad/AppAdTakeoverFloat.vue';
import {
	AdSettingsContainer,
	releasePageAdsSettings,
	setPageAdsSettings,
	useAdStore,
} from '../../../_common/ad/ad-store';
import AppAdGptVideo from '../../../_common/ad/gpt/AppAdGptVideo.vue';
import AppAdWidget from '../../../_common/ad/widget/AppAdWidget.vue';
import { Api } from '../../../_common/api/api.service';
import { isDynamicGoogleBot } from '../../../_common/device/device.service';
import { GameBuildModel } from '../../../_common/game/build/build.model';
import { GameModel } from '../../../_common/game/game.model';
import { GameSongModel } from '../../../_common/game/song/song.model';
import AppGameThumbnail from '../../../_common/game/thumbnail/AppGameThumbnail.vue';
import { HistoryTick } from '../../../_common/history-tick/history-tick-service';
import { setAppPromotionCohort, useAppPromotionStore } from '../../../_common/mobile-app/store';
import { Navigate } from '../../../_common/navigate/navigate.service';
import { buildPayloadErrorForStatusCode } from '../../../_common/payload/payload-service';
import { createAppRoute, defineAppRouteOptions } from '../../../_common/route/route-component';
import { Screen } from '../../../_common/screen/screen-service';
import AppScrollAffix from '../../../_common/scroll/AppScrollAffix.vue';
import AppSpacer from '../../../_common/spacer/AppSpacer.vue';
import { $gettext } from '../../../_common/translate/translate.service';
import { kLineHeightComputed } from '../../../_styles/variables';
import { sleep } from '../../../utils/utils';
import AppPageContainer from '../../components/page-container/AppPageContainer.vue';
import AppShellPageBackdrop from '../../components/shell/AppShellPageBackdrop.vue';

defineOptions({
	...defineAppRouteOptions({
		reloadOn: { params: ['type'], query: ['game_id', 'build_id'] },
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
	}),
});

const DownloadDelay = 8_000;

const adStore = useAdStore();
const appPromotionStore = useAppPromotionStore();
const route = useRoute();

const downloadStarted = ref(false);
const game = ref<GameModel>(null as any);
const build = ref<null | GameBuildModel>(null);
const ownerGames = ref<GameModel[]>([]);
const recommendedGames = ref<GameModel[]>([]);

const videoAdDone = ref(false);
const showMonetizeMoreFallback = ref(false);
let videoAdResolver: () => void;
const videoAdPromise = new Promise<void>(resolve => {
	videoAdResolver = resolve;
});

const type = toRef(() => route.params['type'] as 'build' | 'soundtrack');

// Put the first two games as the dev's games, and then fill the rest
// with recommended.
const games = computed(() =>
	[...ownerGames.value.slice(0, 2), ...recommendedGames.value].slice(0, 6)
);

setAppPromotionCohort(appPromotionStore, 'store');

const { isBootstrapped } = createAppRoute({
	routeTitle: computed(() => {
		if (game.value) {
			return type.value === 'build'
				? $gettext(`Downloading %{ game }`, {
						game: game.value.title,
				  })
				: $gettext(`Downloading soundtrack for %{ game }`, {
						game: game.value.title,
				  });
		}
		return null;
	}),
	async onResolved({ payload }) {
		game.value = new GameModel(payload.game);
		build.value = payload.build ? new GameBuildModel(payload.build) : null;
		downloadStarted.value = false;

		ownerGames.value = GameModel.populate(payload.ownerGames);
		recommendedGames.value = GameModel.populate(payload.recommendedGames);
		_setAdSettings();

		// Don't download on SSR.
		if (import.meta.env.SSR || isDynamicGoogleBot()) {
			return;
		}

		// We do it like this so that we start getting the download URL right
		// away while still waiting for the timeout.
		const [data] = await Promise.all<any>([
			type.value === 'build'
				? build.value!.getDownloadUrl({
						forceDownload: true,
				  })
				: GameSongModel.getSoundtrackDownloadUrl(game.value.id),

			// Wait at least this long before spawning the download.
			sleep(DownloadDelay),

			// Wait for the video ad to be ready.
			videoAdPromise,
		]);

		downloadStarted.value = true;

		// While developing we often don't want to be downloading files every
		// time the page reloads.
		if (GJ_ENVIRONMENT === 'production' && GJ_BUILD_TYPE === 'build') {
			if (GJ_IS_DESKTOP_APP) {
				Navigate.gotoExternal(data.url);
			} else {
				Navigate.goto(data.url);
			}
		}
	},
	onDestroyed() {
		_releaseAdSettings;
	},
});

function _setAdSettings() {
	if (!game.value) {
		return;
	}

	const settings = new AdSettingsContainer();
	settings.resource = game.value;
	settings.isPageDisabled =
		game.value.has_adult_content || game.value.isOwned || game.value.is_paid_game;

	setPageAdsSettings(adStore, settings);
}

function _releaseAdSettings() {
	releasePageAdsSettings(adStore);
}

function onVideoAdDone() {
	videoAdDone.value = true;
	videoAdResolver();
}

function onVideoAdFail() {
	// Show MonetizeMore fallback when IMA SDK fails.
	showMonetizeMoreFallback.value = true;

	// We resolve the video ad promise anyway so that the download can start.
	onVideoAdDone();
}
</script>

<template>
	<AppShellPageBackdrop>
		<AppAdTakeoverBackground />

		<section
			v-if="isBootstrapped"
			class="section"
			:style="{
				// We want to keep the top part as thin as possible.
				paddingTop: kLineHeightComputed.px,
			}"
		>
			<AppAdTakeoverFloat v-if="Screen.isDesktop">
				<AppAdWidget
					unit-name="billboard"
					:style-override="{
						marginBottom: `16px`,
					}"
				/>
			</AppAdTakeoverFloat>

			<AppPageContainer xl>
				<template v-if="Screen.isDesktop" #left>
					<AppScrollAffix>
						<AppAdTakeoverFloat>
							<AppAdWidget unit-name="halfpage" takeover />
						</AppAdTakeoverFloat>
					</AppScrollAffix>
				</template>
				<template v-if="Screen.isLg" #right>
					<AppScrollAffix>
						<AppAdTakeoverFloat>
							<AppAdWidget unit-name="halfpage" />
						</AppAdTakeoverFloat>
					</AppScrollAffix>
				</template>
				<template #default>
					<AppAdTakeoverFloat>
						<div class="sheet sheet-elevate">
							<h2 class="section-header">
								<span>
									<template v-if="type === 'build'">
										{{
											$gettext(`Downloading %{ game }`, { game: game.title })
										}}
									</template>
									<template v-else-if="type === 'soundtrack'">
										{{
											$gettext(`Downloading soundtrack for %{ game }...`, {
												game: game.title,
											})
										}}
									</template>
								</span>
							</h2>

							<p class="small text-muted sans-margin-bottom">
								{{
									!videoAdDone
										? $gettext(`Your download will begin after the video...`)
										: $gettext(`Your download will begin in just a moment...`)
								}}
							</p>
						</div>

						<template v-if="!videoAdDone">
							<AppAdGptVideo @fail="onVideoAdFail" @done="onVideoAdDone" />
							<AppSpacer vertical :scale="4" />
						</template>
						<template v-else-if="showMonetizeMoreFallback">
							<AppAdWidget unit-name="video" />
							<AppSpacer vertical :scale="4" />
						</template>

						<div class="sheet sheet-elevate">
							<h2 class="sans-margin-top">
								{{ $gettext(`You may also like`) }}
							</h2>

							<div class="scrollable-grid-xs">
								<div class="row">
									<div
										v-for="recommendedGame of games"
										:key="recommendedGame.id"
										class="scrollable-grid-item col-xs-10 col-sm-6"
									>
										<AppGameThumbnail :game="recommendedGame" />
									</div>
								</div>
							</div>
						</div>
					</AppAdTakeoverFloat>
				</template>
			</AppPageContainer>
		</section>
	</AppShellPageBackdrop>
</template>
