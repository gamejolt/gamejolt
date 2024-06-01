<script lang="ts">
import { computed, Ref, ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import AppAdWidget from '../../../../_common/ad/widget/AppAdWidget.vue';
import AppButton from '../../../../_common/button/AppButton.vue';
import AppCommunityThumbnail from '../../../../_common/community/thumbnail/AppCommunityThumbnail.vue';
import { formatNumber } from '../../../../_common/filters/number';
import AppRealmFullCard from '../../../../_common/realm/AppRealmFullCard.vue';
import { createAppRoute, defineAppRouteOptions } from '../../../../_common/route/route-component';
import { Screen } from '../../../../_common/screen/screen-service';
import AppScrollAffix from '../../../../_common/scroll/AppScrollAffix.vue';
import AppSpacer from '../../../../_common/spacer/AppSpacer.vue';
import { $gettext } from '../../../../_common/translate/translate.service';
import AppUserCard from '../../../../_common/user/card/AppUserCard.vue';
import { styleChangeBg, styleElevate } from '../../../../_styles/mixins';
import { kBorderRadiusLg, kLayerAds } from '../../../../_styles/variables';
import { getQuery } from '../../../../utils/router';
import { ActivityFeedService } from '../../../components/activity/feed/feed-service';
import { ActivityFeedView } from '../../../components/activity/feed/view';
import AppGameGrid from '../../../components/game/grid/AppGameGrid.vue';
import AppGameList from '../../../components/game/list/AppGameList.vue';
import { AppActivityFeedLazy as AppActivityFeed } from '../../../components/lazy';
import AppPageContainer from '../../../components/page-container/AppPageContainer.vue';
import { sendSearch } from '../../../components/search/search-service';
import { routeSearchRealms } from '../realms/realms.route';
import { useSearchRouteController } from '../RouteSearch.vue';

const REALM_COL_DESKTOP = 4;
const REALM_COL_SM = 3;
const REALM_COL_XS = 2;

export default {
	...defineAppRouteOptions({
		cache: true,
		reloadOn: 'always',
		resolver: ({ route }) => sendSearch(getQuery(route, 'q') ?? ''),
	}),
};
</script>

<script lang="ts" setup>
const route = useRoute();
const { processPayload, hasSearch, searchPayload, query } = useSearchRouteController()!;

const feed = ref(null) as Ref<ActivityFeedView | null>;

createAppRoute({
	routeTitle: computed(() =>
		$gettext(`"%{ query }" on Game Jolt`, {
			query: query.value,
		})
	),
	disableTitleSuffix: true,
	onInit() {
		feed.value = ActivityFeedService.bootstrapFeedFromCache();
	},
	onResolved({ payload, fromCache }) {
		processPayload({ payload });

		feed.value = ActivityFeedService.routed(
			feed.value,
			{
				type: 'EventItem',
				name: 'search',
				url: `/web/posts/fetch/search/${encodeURIComponent(
					getQuery(route, 'q')!
				)}?post-feed-use-offset=1`,
				shouldShowFollow: true,
				itemsPerPage: payload.postsPerPage,
			},
			payload.posts,
			fromCache
		);
	},
});

const slicedUsers = computed(() =>
	Screen.isXs ? searchPayload.value.users : searchPayload.value.users.slice(0, 2)
);

const slicedCommunities = computed(() => searchPayload.value.communities.slice(0, 4));

const slicedRealms = computed(() => {
	let count = REALM_COL_DESKTOP;
	if (Screen.isSm) {
		count = REALM_COL_SM;
	} else if (Screen.isXs) {
		count = REALM_COL_XS;
	}

	return searchPayload.value.realms.slice(0, count);
});
</script>

<template>
	<template v-if="hasSearch">
		<template v-if="slicedRealms.length">
			<div class="container">
				<h3 class="-heading">
					{{ $gettext(`Realms`) }}

					<AppButton
						v-if="searchPayload.realmsCount > slicedRealms.length"
						class="-heading-more"
						trans
						:to="{ name: routeSearchRealms.name, query: { q: query } }"
					>
						{{ $gettext(`View all`) }}
					</AppButton>
				</h3>

				<div
					class="-realm-cards"
					:style="[
						`--col-desktop: ${REALM_COL_DESKTOP}`,
						`--col-sm: ${REALM_COL_SM}`,
						`--col-xs: ${REALM_COL_XS}`,
					]"
				>
					<AppRealmFullCard
						v-for="realm of slicedRealms"
						:key="realm.id"
						:realm="realm"
						:to="realm.routeLocation"
						overlay-content
						no-sheet
						no-follow
						label-position="bottom-left"
					/>
				</div>
			</div>

			<AppSpacer vertical :scale="4" />
		</template>

		<AppPageContainer no-left order="right,main">
			<!-- Games -->
			<template v-if="!Screen.isMobile" #right>
				<AppSpacer vertical :scale="6" />

				<AppScrollAffix
					:style="{
						position: `relative`,
						zIndex: kLayerAds,
						maxWidth: `350px`,
						// Eyeballed to try to get the games and users headings
						// to match up when there's communities.
						minHeight: `225px`,
						margin: `0 auto`,
					}"
					:padding="Screen.isLg ? 80 : 8"
				>
					<AppAdWidget
						:style="{
							...styleChangeBg('bg'),
							...styleElevate(3),
							minWidth: `300px`,
							paddingTop: `8px`,
							paddingBottom: `8px`,
							borderRadius: kBorderRadiusLg.px,
							padding: `8px`,
						}"
						size="rectangle"
						placement="content"
					/>
				</AppScrollAffix>

				<template v-if="searchPayload.games.length">
					<h3 class="-heading">
						<AppButton
							class="pull-right"
							trans
							:to="{ name: 'search.games', query: { q: query } }"
						>
							{{ $gettext(`View all`) }}
						</AppButton>

						<RouterLink
							class="link-unstyled"
							:to="{ name: 'search.games', query: { q: query } }"
						>
							{{ $gettext(`Games`) }}
						</RouterLink>
						{{ ' ' }}
						<small>({{ formatNumber(searchPayload.gamesCount) }})</small>
					</h3>

					<AppGameGrid
						v-if="Screen.isMobile"
						:games="searchPayload.games"
						force-scrollable
						event-label="search-overview-games"
					/>
					<AppGameList
						v-else
						:games="searchPayload.games"
						event-label="search-overview-games"
					/>

					<div class="hidden-xs hidden-sm">
						<RouterLink
							class="link-muted"
							:to="{ name: 'search.games', query: { q: query } }"
						>
							{{ $gettext(`View all`) }}
						</RouterLink>
					</div>
				</template>
			</template>

			<template #default>
				<!-- Communities -->
				<template v-if="searchPayload.communities.length">
					<h3 class="-heading">
						<AppButton
							class="pull-right"
							trans
							:to="{ name: 'search.communities', query: { q: query } }"
						>
							{{ $gettext(`View all`) }}
						</AppButton>

						<RouterLink
							class="link-unstyled"
							:to="{ name: 'search.communities', query: { q: query } }"
						>
							{{ $gettext(`Communities`) }}
						</RouterLink>
						{{ ' ' }}
						<small>({{ formatNumber(searchPayload.communitiesCount) }})</small>
					</h3>

					<div class="scrollable-grid-xs">
						<div class="row">
							<div
								v-for="community of slicedCommunities"
								:key="community.id"
								class="scrollable-grid-item col-xs-5 col-sm-3"
							>
								<AppCommunityThumbnail :community="community" />
							</div>
						</div>
					</div>

					<AppSpacer vertical :scale="4" />
				</template>

				<!-- Users -->
				<template v-if="searchPayload.users.length">
					<h3 class="-heading">
						<AppButton
							class="pull-right"
							trans
							:to="{ name: 'search.users', query: { q: query } }"
						>
							{{ $gettext(`View all`) }}
						</AppButton>

						<RouterLink
							class="link-unstyled"
							:to="{ name: 'search.users', query: { q: query } }"
						>
							{{ $gettext(`Users`) }}
						</RouterLink>
						{{ ' ' }}
						<small>({{ formatNumber(searchPayload.usersCount) }})</small>
					</h3>

					<div class="scrollable-grid-xs">
						<div class="row">
							<div
								v-for="user of slicedUsers"
								:key="user.id"
								class="scrollable-grid-item col-xs-10 col-sm-6"
							>
								<AppUserCard :user="user" elevate />
							</div>
						</div>
					</div>
				</template>

				<!-- Posts -->
				<template v-if="feed && feed.hasItems">
					<h3 class="-heading">
						{{ $gettext(`Posts`) }}
					</h3>

					<AppActivityFeed :feed="feed" show-ads />
				</template>
			</template>
		</AppPageContainer>
	</template>
</template>

<style lang="stylus" scoped>
.-heading
	clearfix()
	margin-top: $line-height-computed

.-heading-more
	float: right

.-realm-cards
	display: grid
	--grid-cols: var(--col-desktop)
	gap: 24px
	grid-template-columns: repeat(var(--grid-cols), 1fr)
	justify-content: center

	@media $media-sm
		--grid-cols: var(--col-sm)
		gap: 24px

	@media $media-xs
		--grid-cols: var(--col-xs)
		gap: 16px
</style>
