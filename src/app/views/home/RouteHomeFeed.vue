<script lang="ts">
import {
	computed,
	defineAsyncComponent,
	provide,
	reactive,
	Ref,
	ref,
	shallowRef,
	watch,
} from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { router } from '..';
import {
	trackExperimentEngagement,
	trackPageViewAfterRoute,
} from '../../../_common/analytics/analytics.service';
import { Api } from '../../../_common/api/api.service';
import AppButton from '../../../_common/button/AppButton.vue';
import { configHomeFeedSwitcher } from '../../../_common/config/config.service';
import { Fireside } from '../../../_common/fireside/fireside.model';
import { FiresidePost } from '../../../_common/fireside/post/post-model';
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
import { EventSubscription } from '../../../_common/system/event/event-topic';
import { vAppTooltip } from '../../../_common/tooltip/tooltip-directive';
import { styleWhen } from '../../../_styles/mixins';
import { kLineHeightComputed } from '../../../_styles/variables';
import { numberSort } from '../../../utils/array';
import { fuzzysearch } from '../../../utils/string';
import { ActivityFeedService } from '../../components/activity/feed/feed-service';
import { ActivityFeedView } from '../../components/activity/feed/view';
import { FeaturedItem } from '../../components/featured-item/featured-item.model';
import { onFiresideStart } from '../../components/grid/client.service';
import { useGridStore } from '../../components/grid/grid-store';
import AppPageContainer from '../../components/page-container/AppPageContainer.vue';
import AppPostAddButton from '../../components/post/add-button/AppPostAddButton.vue';
import AppDailyQuests from '../../components/quest/AppDailyQuests.vue';
import AppShellPageBackdrop from '../../components/shell/AppShellPageBackdrop.vue';
import { useQuestStore } from '../../store/quest';
import { createRealmRouteStore, RealmRouteStore } from '../realms/view/view.store';
import AppHomeFireside from './_fireside/AppHomeFireside.vue';
import AppHomeFeaturedBanner from './AppHomeFeaturedBanner.vue';
import AppHomeFeedMenu from './AppHomeFeedMenu.vue';
import AppHomeFeedSwitcher, {
	RealmPathHistoryStateKey,
	RealmTabData,
} from './feed-switcher/AppHomeFeedSwitcher.vue';
import { HOME_FEED_ACTIVITY, HOME_FEED_FYP, HomeFeedService } from './home-feed.service';
import {
	getCurrentHomeRouteAnalyticsPath,
	getNewHomeRouteAnalyticsPath,
	updateHomeRouteAnalyticsPath,
} from './RouteHome.vue';

class DashGame {
	constructor(
		public id: number,
		public title: string,
		public ownerName: string,
		public createdOn: number
	) {}
}

interface RealmFeedData {
	store: RealmRouteStore;
	feed: ActivityFeedView | null;
	firesideData: FiresideFeedData;
}

interface FiresideFeedData {
	loadUrl: string;
	isLoading: boolean;
	isBootstrapped: boolean;
	featuredFireside: Fireside | undefined;
	userFireside: Fireside | undefined;
	eventFireside: Fireside | undefined;
	firesides: Fireside[];
	refresh: () => Promise<void>;
}

export type RouteActivityFeedController = ReturnType<typeof createActivityFeedController>;

function createActivityFeedController() {
	const feed = ref(null) as Ref<ActivityFeedView | null>;
	return { feed };
}

const RouteHomeRealm = defineAsyncComponent(() =>
	asyncRouteLoader(router, import('./RouteHomeRealm.vue'))
);
const RouteHomeActivity = defineAsyncComponent(() =>
	asyncRouteLoader(router, import('./RouteHomeActivity.vue'))
);
const RouteHomeFyp = defineAsyncComponent(() =>
	asyncRouteLoader(router, import('./RouteHomeFYP.vue'))
);

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
const { fetchDailyQuests, isLoading: isQuestStoreLoading, dailyQuests } = useQuestStore();
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

let afterEachDeregister: (() => void) | null = null;

const games = ref<DashGame[]>([]);
const gameFilterQuery = ref('');
const isShowingAllGames = ref(false);

const featuredItem = ref<FeaturedItem>();
const isLoadingQuests = ref(true);

const homeFiresideData = ref(
	reactive({
		loadUrl: `/web/fireside/user-list?amount=14`,
		isLoading: true,
		isBootstrapped: false,
		featuredFireside: undefined,
		userFireside: undefined,
		eventFireside: undefined,
		firesides: [],
		refresh: () => refreshHomeFiresides(homeFiresideData.value),
	})
) as Ref<FiresideFeedData>;

const currentFiresideData = computed(() => {
	if (configHomeFeedSwitcher.value && realmFeedData.value?.firesideData) {
		return realmFeedData.value.firesideData;
	}
	return homeFiresideData.value;
});

let _firesideStartSubscription: EventSubscription | undefined;

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

const realmPath = ref<string>();
const realmFeedData = ref(null) as Ref<RealmFeedData | null>;

const realm = computed(() => realmFeedData.value?.store.realm.value);
const realmFeed = computed(() => realmFeedData.value?.feed);

watch(realmPath, async path => {
	// If our realm path changed, we need to update our analytics path. If we
	// don't do this, we won't be logging page views properly when navigating
	// between realms and our root page feed (url is the same, history state
	// data is different).
	afterRouteChange();

	if (!path || !configHomeFeedSwitcher.value) {
		realmFeedData.value = null;
		return;
	}

	const feedStore = createRealmRouteStore();
	const feedData: RealmFeedData = reactive({
		store: shallowRef(feedStore),
		feed: null,
		firesideData: {
			loadUrl: `/web/realms/${path}`,
			isLoading: true,
			isBootstrapped: false,
			featuredFireside: undefined,
			userFireside: feedStore.userFireside,
			eventFireside: undefined,
			firesides: feedStore.firesides,
			refresh: async () => {
				feedData.firesideData.isLoading = true;
				try {
					const payload = await Api.sendRequest(`/web/realms/${path}`);
					feedStore.processPayload(payload);
				} catch (e) {
					console.error('Failed to refresh firesides for realm.', e);
				}
				feedData.firesideData.isLoading = false;
			},
		},
	});
	realmFeedData.value = feedData;

	const cacheTag = `realm-${path}`;
	const cachedFeed = ActivityFeedService.bootstrapFeedFromCache({ cacheTag });
	feedData.feed = cachedFeed;

	const [realmPayload, feedPayload] = await Promise.all([
		Api.sendRequest(`/web/realms/${path}`),
		Api.sendRequest(ActivityFeedService.makeFeedUrl(route, `/web/posts/fetch/realm/${path}`)),
	]);

	if (realmPath.value !== path) {
		console.warn('Realm path changed again, aborting.', path, realmPath.value);
		return;
	}
	if (!realmPayload || !feedPayload) {
		console.warn('Realm payload or feed payload is missing, aborting.');
		return;
	}
	feedStore.processPayload(realmPayload);

	feedData.feed = ActivityFeedService.routed(
		feedData.feed,
		{
			type: 'EventItem',
			name: 'realm',
			url: `/web/posts/fetch/realm/${path}`,
			shouldShowFollow: true,
			itemsPerPage: feedPayload.perPage,
			cacheTag,
		},
		feedPayload.items,
		cachedFeed !== null
	);

	feedData.firesideData.isLoading = false;
	feedData.firesideData.isBootstrapped = true;
});

const feedTab = computed(() => {
	if (configHomeFeedSwitcher.value && realmPath.value) {
		return { realmPath: realmPath.value } as RealmTabData;
	}
	return HomeFeedService.getRouteFeedTab(route);
});

const tabs = computed(() => {
	if (HomeFeedService.getDefault() === HOME_FEED_FYP) {
		return [HOME_FEED_FYP, HOME_FEED_ACTIVITY];
	}

	return [HOME_FEED_ACTIVITY, HOME_FEED_FYP];
});

const appRoute = createAppRoute({
	routeTitle: null,
	onInit() {
		realmPath.value = history.state[RealmPathHistoryStateKey];

		if (!afterEachDeregister) {
			afterEachDeregister = router.afterEach(() => {
				realmPath.value = history.state[RealmPathHistoryStateKey];
			});
		}
	},
	onResolved({ payload }) {
		trackExperimentEngagement(configHomeFeedSwitcher);

		featuredItem.value = payload.featuredItem
			? new FeaturedItem(payload.featuredItem)
			: undefined;

		games.value = (payload.ownerGames as DashGame[])
			.map(i => new DashGame(i.id, i.title, i.ownerName, i.createdOn))
			.sort((a, b) => numberSort(a.createdOn, b.createdOn))
			.reverse();

		homeFiresideData.value.refresh();
		refreshQuests();
		_firesideStartSubscription = onFiresideStart.subscribe(() =>
			homeFiresideData.value.refresh()
		);

		if (payload.eventFireside) {
			homeFiresideData.value.eventFireside = new Fireside(payload.eventFireside);
		}

		afterRouteChange();
	},
	onDestroyed() {
		_firesideStartSubscription?.close();
		if (afterEachDeregister) {
			afterEachDeregister();
			afterEachDeregister = null;
		}
	},
});

function afterRouteChange() {
	const currentPath = getCurrentHomeRouteAnalyticsPath(route);
	const proposedPath = getNewHomeRouteAnalyticsPath(route, user.value);
	// Ignore if our analytics path won't be changed.
	if (currentPath === proposedPath) {
		return;
	}

	updateHomeRouteAnalyticsPath(route, user.value);
	trackPageViewAfterRoute(router);
}

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

function onPostAdded(post: FiresidePost) {
	let feed: ActivityFeedView | null = null;
	if (realmFeedData.value?.feed) {
		feed = realmFeedData.value.feed;
	} else {
		feed = controller.feed.value;
	}

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

async function refreshHomeFiresides(data: FiresideFeedData) {
	if (!user.value) {
		return;
	}

	data.isLoading = true;

	try {
		const payload = await Api.sendRequest(data.loadUrl, undefined, {
			detach: true,
		});
		data.userFireside = payload.userFireside ? new Fireside(payload.userFireside) : undefined;
		data.firesides = payload.firesides ? Fireside.populate(payload.firesides) : [];
		data.featuredFireside = payload.featuredFireside
			? new Fireside(payload.featuredFireside)
			: undefined;
	} catch (error) {
		console.error('Failed to refresh fireside data.', error);
	}

	data.isLoading = false;
	data.isBootstrapped = true;
}

async function refreshQuests() {
	if (!user.value) {
		return;
	}

	isLoadingQuests.value = true;
	await fetchDailyQuests();
	isLoadingQuests.value = false;
}
</script>

<template>
	<AppShellPageBackdrop>
		<AppHomeFeedSwitcher
			v-if="configHomeFeedSwitcher.value"
			:style="{
				marginTop: `8px`,
				position: `relative`,
				zIndex: 2,
				marginBottom: kLineHeightComputed.px,
			}"
			:feed-tab="feedTab"
		/>

		<section
			class="section"
			:style="
				styleWhen(configHomeFeedSwitcher.value, {
					position: `relative`,
					zIndex: 1,
					paddingTop: 0,
				})
			"
		>
			<AppPageContainer xl>
				<template #left>
					<template v-if="Screen.isDesktop">
						<div v-if="!configHomeFeedSwitcher.value" class="-top-spacer" />

						<AppStickerChargeCard
							header-charge
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

				<template v-if="!Screen.isMobile" #right>
					<div v-if="!configHomeFeedSwitcher.value" class="-top-spacer" />

					<template v-if="featuredItem">
						<AppHomeFeaturedBanner :featured-item="featuredItem" />
						<AppSpacer vertical :scale="8" />
					</template>

					<AppHomeFireside
						:featured-fireside="currentFiresideData.featuredFireside"
						:user-fireside="currentFiresideData.userFireside"
						:firesides="currentFiresideData.firesides"
						:is-loading="currentFiresideData.isLoading"
						:show-placeholders="!currentFiresideData.isBootstrapped"
						:initial-realm="realm"
						@request-refresh="currentFiresideData.refresh()"
					/>
				</template>

				<AppHomeFeedMenu
					v-if="
						!configHomeFeedSwitcher.value &&
						Screen.isDesktop &&
						typeof feedTab === 'string'
					"
					:tabs="tabs"
					:feed-tab="feedTab"
				/>

				<!-- Realm feed will handle its own add button. -->
				<AppPostAddButton
					v-if="!configHomeFeedSwitcher.value || !realmPath"
					@add="onPostAdded"
				/>

				<template v-if="Screen.isMobile">
					<template v-if="!Screen.isXs && featuredItem">
						<AppHomeFeaturedBanner :featured-item="featuredItem" />
						<AppSpacer vertical :scale="4" />
					</template>

					<AppHomeFireside
						:user-fireside="currentFiresideData.userFireside"
						:firesides="currentFiresideData.firesides"
						:is-loading="currentFiresideData.isLoading"
						:show-placeholders="!currentFiresideData.isBootstrapped"
						:initial-realm="realm"
						@request-refresh="currentFiresideData.refresh()"
					/>

					<hr class="full-bleed" />

					<AppHomeFeedMenu
						v-if="!configHomeFeedSwitcher.value && typeof feedTab === 'string'"
						:tabs="tabs"
						:feed-tab="feedTab"
					/>
				</template>

				<RouteHomeRealm
					v-if="configHomeFeedSwitcher.value && realmPath"
					:key="realmPath"
					:realm="realm"
					:feed="realmFeed"
					@post-added="onPostAdded"
				/>
				<RouteHomeActivity v-else-if="feedTab === 'activity'" />
				<RouteHomeFyp v-else-if="feedTab === 'fyp'" />
			</AppPageContainer>
		</section>
	</AppShellPageBackdrop>
</template>

<style lang="stylus" scoped>
// We add this margin to try to shift the page content below the For You |
// Following tabs.
.-top-spacer
	margin-top: 58px

.-game-list
	a
		text-overflow()
</style>
