<script lang="ts">
import { computed, ref, toRef } from 'vue';
import { useRoute } from 'vue-router';
import {
	AdSettingsContainer,
	releasePageAdsSettings,
	setPageAdsSettings,
	useAdStore,
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
import { createAppRoute, defineAppRouteOptions } from '../../../_common/route/route-component';
import { Screen } from '../../../_common/screen/screen-service';
import AppScrollAffix from '../../../_common/scroll/AppScrollAffix.vue';
import AppSpacer from '../../../_common/spacer/AppSpacer.vue';
import { $gettext } from '../../../_common/translate/translate.service';
import { kLineHeightComputed } from '../../../_styles/variables';
import { sleep } from '../../../utils/utils';
import AppPageContainer from '../../components/page-container/AppPageContainer.vue';

const DownloadDelay = 10_000;

export default {
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
};
</script>

<script lang="ts" setup>
const adStore = useAdStore();
const appPromotionStore = useAppPromotionStore();
const route = useRoute();

const started = ref(false);
const game = ref<GameModel>(null as any);
const build = ref<null | GameBuildModel>(null);
const ownerGames = ref<GameModel[]>([]);
const recommendedGames = ref<GameModel[]>([]);

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
		started.value = false;

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
		]);

		started.value = true;

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
</script>

<template>
	<section
		v-if="isBootstrapped"
		class="section"
		:style="{
			// We want to keep the top part as thin as possible.
			paddingTop: kLineHeightComputed.px,
		}"
	>
		<AppAdWidget
			v-if="!Screen.isMobile"
			:style="{
				marginBottom: `16px`,
			}"
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
				<h2
					class="section-header"
					:style="{
						display: `flex`,
						flexDirection: `row`,
						justifyContent: `space-between`,
						marginBottom: 0,
						// We do it this way so that the header doesn't jump when the loading disappears.
						height: `36px`,
					}"
				>
					<span>
						<template v-if="type === 'build'">
							{{ $gettext(`Downloading %{ game }...`, { game: game.title }) }}
						</template>
						<template v-else-if="type === 'soundtrack'">
							{{
								$gettext(`Downloading soundtrack for %{ game }...`, {
									game: game.title,
								})
							}}
						</template>
					</span>

					<div v-if="!started">
						<AppLoading :hide-label="true" :style="{ marginBottom: 0 }" />
					</div>
				</h2>

				<p class="small text-muted">
					{{ $gettext(`Your download will begin in just a moment...`) }}
				</p>

				<AppSpacer vertical :scale="2" />

				<!-- <AppAdWidget size="video" placement="content" /> -->

				<h2>
					{{ $gettext(`You may also like`) }}
				</h2>

				<div class="scrollable-grid-xs">
					<div class="row">
						<div
							v-for="recommendedGame of games"
							:key="recommendedGame.id"
							class="scrollable-grid-item col-xs-10 col-sm-6"
						>
							<AppGameThumbnail
								v-app-track-event="'recommended-games:click:download'"
								:game="recommendedGame"
							/>
						</div>
					</div>
				</div>
			</template>
		</AppPageContainer>
	</section>
</template>
