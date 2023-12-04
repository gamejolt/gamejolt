<script lang="ts">
import { computed, defineAsyncComponent, provide, Ref, ref, watch } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { router } from '..';
import { isAdEnthused } from '../../../_common/ad/ad-store';
import AppAdWidget from '../../../_common/ad/widget/AppAdWidget.vue';
import { Api } from '../../../_common/api/api.service';
import AppButton from '../../../_common/button/AppButton.vue';
import { FiresidePostModel } from '../../../_common/fireside/post/post-model';
import AppInviteCard from '../../../_common/invite/AppInviteCard.vue';
import {
	asyncRouteLoader,
	createAppRoute,
	defineAppRouteOptions,
} from '../../../_common/route/route-component';
import { Screen } from '../../../_common/screen/screen-service';
import AppSpacer from '../../../_common/spacer/AppSpacer.vue';
import AppStickerChargeCard from '../../../_common/sticker/charge/AppStickerChargeCard.vue';
import { useCommonStore } from '../../../_common/store/common-store';
import { vAppTooltip } from '../../../_common/tooltip/tooltip-directive';
import {
	buildCSSPixelValue,
	kGridGutterWidth,
	kGridGutterWidthXs,
} from '../../../_styles/variables';
import { numberSort } from '../../../utils/array';
import { fuzzysearch } from '../../../utils/string';
import { ActivityFeedService } from '../../components/activity/feed/feed-service';
import { ActivityFeedView } from '../../components/activity/feed/view';
import { FeaturedItemModel } from '../../components/featured-item/featured-item.model';
import { useGridStore } from '../../components/grid/grid-store';
import AppPageContainer from '../../components/page-container/AppPageContainer.vue';
import AppPostAddButton from '../../components/post/add-button/AppPostAddButton.vue';
import AppDailyQuests from '../../components/quest/AppDailyQuests.vue';
import AppShellPageBackdrop from '../../components/shell/AppShellPageBackdrop.vue';
import { fetchDailyQuests, useQuestStore } from '../../store/quest';
import AppHomeFeaturedBanner from './AppHomeFeaturedBanner.vue';
import AppHomeFeedMenu from './AppHomeFeedMenu.vue';
import { HOME_FEED_ACTIVITY, HOME_FEED_FYP, HomeFeedService } from './home-feed.service';

const RouteHomeActivity = defineAsyncComponent(() =>
	asyncRouteLoader(router, import('./RouteHomeActivity.vue'))
);
const RouteHomeFyp = defineAsyncComponent(() =>
	asyncRouteLoader(router, import('./RouteHomeFYP.vue'))
);

class DashGame {
	constructor(
		public id: number,
		public title: string,
		public ownerName: string,
		public createdOn: number
	) {}
}

export type RouteActivityFeedController = ReturnType<typeof createActivityFeedController>;

function createActivityFeedController() {
	const feed = ref(null) as Ref<ActivityFeedView | null>;
	return { feed };
}

export default {
	...defineAppRouteOptions({
		cache: true,
		lazy: true,
		resolver: () => Api.sendRequest('/web/dash/home'),
	}),
};
</script>

<script lang="ts" setup>
const { user } = useCommonStore();
const questStore = useQuestStore();
const { isLoading: isQuestStoreLoading, dailyQuests } = questStore;
const route = useRoute();

// Mark as loading until Grid is fully bootstrapped.
const { grid } = useGridStore();
const isLoadingCharge = ref(grid.value?.bootstrapReceived !== true);
if (isLoadingCharge.value) {
	watch(
		() => grid.value?.bootstrapReceived,
		bootstrapped => {
			if (bootstrapped) {
				isLoadingCharge.value = false;
			}
		}
	);
}

const games = ref<DashGame[]>([]);
const gameFilterQuery = ref('');
const isShowingAllGames = ref(false);

const featuredItem = ref<FeaturedItemModel>();
const isLoadingQuests = ref(true);

const controller = createActivityFeedController();
provide('route-activity-feed', controller);

const hasGamesSection = computed(() => games.value.length > 0 && Screen.isLg);
const hasGameFilter = computed(() => games.value.length > 7);

const filteredGames = computed(() => {
	if (gameFilterQuery.value !== '') {
		return games.value.filter(i => _checkGameFilter(i));
	} else if (isShowingAllGames.value) {
		return games.value;
	}
	return games.value.slice(0, 7);
});

const isShowAllGamesVisible = computed(() => {
	return !isShowingAllGames.value && games.value.length > 7 && gameFilterQuery.value === '';
});

const activeFeedTab = computed(() => HomeFeedService.getRouteFeedTab(route));

const tabs = computed(() => {
	if (HomeFeedService.getDefault() === HOME_FEED_FYP) {
		return [HOME_FEED_FYP, HOME_FEED_ACTIVITY];
	}

	return [HOME_FEED_ACTIVITY, HOME_FEED_FYP];
});

const appRoute = createAppRoute({
	routeTitle: null,
	onResolved({ payload }) {
		featuredItem.value = payload.featuredItem
			? new FeaturedItemModel(payload.featuredItem)
			: undefined;

		games.value = (payload.ownerGames as DashGame[])
			.map(i => new DashGame(i.id, i.title, i.ownerName, i.createdOn))
			.sort((a, b) => numberSort(a.createdOn, b.createdOn))
			.reverse();

		refreshQuests();
	},
});

function _checkGameFilter(game: DashGame) {
	let text = '';
	const search = gameFilterQuery.value.toLowerCase();

	text = game.title.toLowerCase();
	if (fuzzysearch(search, text)) {
		return true;
	}

	if (game.ownerName) {
		text = game.ownerName.toLowerCase();
		if (fuzzysearch(search, text)) {
			return true;
		}
	}

	return false;
}

function onPostAdded(post: FiresidePostModel) {
	const feed = controller.feed.value;
	if (feed) {
		ActivityFeedService.onPostAdded({
			feed,
			post,
			appRoute,
			router,
			route,
		});
	}
}

async function refreshQuests() {
	if (!user.value) {
		return;
	}

	isLoadingQuests.value = true;
	await fetchDailyQuests(questStore);
	isLoadingQuests.value = false;
}

// We add this margin to try to shift the page content below the For You |
// Following tabs.
const topSpacerHeight = buildCSSPixelValue(58);
</script>

<template>
	<AppShellPageBackdrop>
		<section class="section">
			<AppPageContainer
				xl
				sticky-sides
				:sticky-side-top-margin="
					Screen.isXs ? kGridGutterWidthXs.value : kGridGutterWidth.value
				"
			>
				<!-- Left sidebar -->
				<template #left>
					<template v-if="Screen.isDesktop">
						<div :style="{ height: topSpacerHeight.px }" />

						<AppStickerChargeCard
							header-charge
							elevate
							header-spacer-height="6px"
							allow-fully-charged-text
							:is-loading="isLoadingCharge"
						/>
						<AppSpacer vertical :scale="8" />

						<template v-if="user">
							<AppDailyQuests
								disable-on-expiry
								single-row
								:force-loading="isLoadingQuests"
							/>

							<AppSpacer
								v-if="isQuestStoreLoading || dailyQuests.length > 0"
								vertical
								:scale="8"
							/>
						</template>

						<AppInviteCard :user="user!" elevate />

						<template v-if="hasGamesSection">
							<div class="clearfix">
								<div class="pull-right">
									<AppButton
										v-app-tooltip="$gettext(`Add Game`)"
										icon="add"
										circle
										trans
										:to="{ name: 'dash.games.add' }"
									/>
								</div>
								<h4 class="section-header">
									{{ $gettext(`Manage Games`) }}
								</h4>
							</div>

							<template v-if="hasGameFilter">
								<div>
									<input
										v-model="gameFilterQuery"
										type="search"
										class="form-control"
										:placeholder="$gettext(`Filter games`)"
									/>
								</div>
								<br />
							</template>

							<nav class="-game-list platform-list">
								<ul>
									<li v-for="game of filteredGames" :key="game.id">
										<RouterLink
											v-app-track-event="`activity:quick-game`"
											:to="{
												name: 'dash.games.manage.game.overview',
												params: { id: game.id },
											}"
											:title="
												(game.ownerName ? `@${game.ownerName}/` : '') +
												game.title
											"
										>
											<template v-if="game.ownerName">
												<small>@{{ game.ownerName }}</small>
												/
											</template>
											{{ game.title }}
										</RouterLink>
									</li>
								</ul>
							</nav>

							<p v-if="isShowAllGamesVisible">
								<a
									v-app-track-event="`activity:quick-game-all`"
									class="link-muted"
									@click="isShowingAllGames = !isShowingAllGames"
								>
									{{ $gettext(`Show all`) }}
								</a>
							</p>
						</template>
					</template>
				</template>

				<!-- Right sidebar -->
				<template v-if="!Screen.isMobile" #right="{ combined }">
					<div v-if="!combined" :style="{ height: topSpacerHeight.px }" />

					<template v-if="featuredItem">
						<AppHomeFeaturedBanner :featured-item="featuredItem" />
						<AppSpacer vertical :scale="8" />
					</template>

					<AppAdWidget v-if="isAdEnthused" size="video" placement="side" />
				</template>

				<!-- Main -->
				<template #default>
					<AppHomeFeedMenu
						v-if="Screen.isDesktop"
						:tabs="tabs"
						:active-tab="activeFeedTab"
					/>

					<!-- Realm feed will handle its own add button. -->
					<AppPostAddButton @add="onPostAdded" />

					<template v-if="Screen.isMobile">
						<template v-if="!Screen.isXs && featuredItem">
							<AppHomeFeaturedBanner :featured-item="featuredItem" />
							<AppSpacer vertical :scale="4" />
						</template>

						<AppHomeFeedMenu :tabs="tabs" :active-tab="activeFeedTab" />
					</template>

					<RouteHomeActivity v-if="activeFeedTab === HOME_FEED_ACTIVITY" />
					<RouteHomeFyp v-else-if="activeFeedTab === HOME_FEED_FYP" />
				</template>
			</AppPageContainer>
		</section>
	</AppShellPageBackdrop>
</template>

<style lang="stylus" scoped>
.-game-list
	a
		text-overflow()
</style>
