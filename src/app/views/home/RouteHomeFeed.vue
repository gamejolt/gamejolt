<script lang="ts">
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
import { computed, defineAsyncComponent, provide, Ref, ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { router } from '..';
import { numberSort } from '../../../utils/array';
import { fuzzysearch } from '../../../utils/string';
import { trackExperimentEngagement } from '../../../_common/analytics/analytics.service';
import { Api } from '../../../_common/api/api.service';
import AppButton from '../../../_common/button/AppButton.vue';
import { configHomeDefaultFeed } from '../../../_common/config/config.service';
import { Fireside } from '../../../_common/fireside/fireside.model';
import { FiresidePost } from '../../../_common/fireside/post/post-model';
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
import AppTranslate from '../../../_common/translate/AppTranslate.vue';
import AppUserCard from '../../../_common/user/card/AppUserCard.vue';
import { ActivityFeedService } from '../../components/activity/feed/feed-service';
import { ActivityFeedView } from '../../components/activity/feed/view';
import { onFiresideStart } from '../../components/grid/client.service';
import AppPageContainer from '../../components/page-container/AppPageContainer.vue';
import AppPostAddButton from '../../components/post/add-button/AppPostAddButton.vue';
import AppDailyQuests from '../../components/quest/AppDailyQuests.vue';
import AppShellPageBackdrop from '../../components/shell/AppShellPageBackdrop.vue';
import { useQuestStore } from '../../store/quest';
import AppHomeFeedMenu from './AppHomeFeedMenu.vue';
import { HomeFeedService, HOME_FEED_ACTIVITY, HOME_FEED_FYP } from './home-feed.service';
import AppHomeFireside from './_fireside/AppHomeFireside.vue';

const { user } = useCommonStore();
const { fetchDailyQuests } = useQuestStore();
const route = useRoute();

const games = ref<DashGame[]>([]);
const gameFilterQuery = ref('');
const isShowingAllGames = ref(false);

const isLoadingQuests = ref(true);
const isLoadingFiresides = ref(true);
const isFiresidesBootstrapped = ref(false);
const featuredFireside = ref<Fireside>();
const userFireside = ref<Fireside>();
const firesides = ref<Fireside[]>([]);
const eventFireside = ref<Fireside>();
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

const feedTab = computed(() => HomeFeedService.getRouteFeedTab(route));

const tabs = computed(() => {
	if (HomeFeedService.getDefault() === HOME_FEED_FYP) {
		return [HOME_FEED_FYP, HOME_FEED_ACTIVITY];
	}

	return [HOME_FEED_ACTIVITY, HOME_FEED_FYP];
});

const appRoute = createAppRoute({
	routeTitle: null,
	onResolved({ payload }) {
		trackExperimentEngagement(configHomeDefaultFeed);

		games.value = (payload.ownerGames as DashGame[])
			.map(i => new DashGame(i.id, i.title, i.ownerName, i.createdOn))
			.sort((a, b) => numberSort(a.createdOn, b.createdOn))
			.reverse();

		refreshFiresides();
		refreshQuests();
		_firesideStartSubscription = onFiresideStart.subscribe(() => refreshFiresides());

		if (payload.eventFireside) {
			eventFireside.value = new Fireside(payload.eventFireside);
		}
	},
	onDestroyed() {
		_firesideStartSubscription?.close();
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

function onPostAdded(post: FiresidePost) {
	const { feed } = controller;
	if (feed.value) {
		ActivityFeedService.onPostAdded({ feed: feed.value, post, appRoute, router, route });
	}
}

async function refreshFiresides() {
	if (!user.value) {
		return;
	}

	isLoadingFiresides.value = true;

	try {
		const payload = await Api.sendRequest(`/web/fireside/user-list?amount=14`, undefined, {
			detach: true,
		});
		userFireside.value = payload.userFireside ? new Fireside(payload.userFireside) : undefined;
		firesides.value = payload.firesides ? Fireside.populate(payload.firesides) : [];
		featuredFireside.value = payload.featuredFireside
			? new Fireside(payload.featuredFireside)
			: undefined;
	} catch (error) {
		console.error('Failed to refresh fireside data.', error);
	}

	isLoadingFiresides.value = false;
	isFiresidesBootstrapped.value = true;
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
		<section class="section">
			<AppPageContainer xl>
				<template #left>
					<AppUserCard v-if="Screen.isDesktop" :user="user!" />

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
								<AppTranslate>Manage Games</AppTranslate>
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
								<AppTranslate>Show all</AppTranslate>
							</a>
						</p>
					</template>
				</template>

				<template v-if="!Screen.isMobile" #right>
					<AppStickerChargeCard header-charge allow-fully-charged-text />
					<AppSpacer vertical :scale="12" />

					<AppDailyQuests
						v-if="user"
						disable-on-expiry
						single-row
						:force-loading="isLoadingQuests"
					/>

					<AppSpacer vertical :scale="12" />

					<AppHomeFireside
						:featured-fireside="featuredFireside"
						:user-fireside="userFireside"
						:firesides="firesides"
						:is-loading="isLoadingFiresides"
						:show-placeholders="!isFiresidesBootstrapped"
						@request-refresh="refreshFiresides()"
					/>
				</template>

				<AppHomeFeedMenu v-if="Screen.isDesktop" :tabs="tabs" :feed-tab="feedTab" />

				<AppPostAddButton @add="onPostAdded" />

				<template v-if="Screen.isMobile">
					<AppHomeFireside
						:user-fireside="userFireside"
						:firesides="firesides"
						:is-loading="isLoadingFiresides"
						:show-placeholders="!isFiresidesBootstrapped"
						@request-refresh="refreshFiresides()"
					/>

					<hr class="full-bleed" />

					<AppHomeFeedMenu :tabs="tabs" :feed-tab="feedTab" />
				</template>

				<RouteHomeActivity v-if="feedTab === 'activity'" />
				<RouteHomeFyp v-else-if="feedTab === 'fyp'" />
			</AppPageContainer>
		</section>
	</AppShellPageBackdrop>
</template>

<style lang="stylus" scoped>
.-game-list
	a
		text-overflow()
</style>
