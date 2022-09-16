<script lang="ts">
import { computed, Ref, ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { getQuery } from '../../../../utils/router';
import AppButton from '../../../../_common/button/AppButton.vue';
import AppCommunityThumbnail from '../../../../_common/community/thumbnail/AppCommunityThumbnail.vue';
import { configRealms } from '../../../../_common/config/config.service';
import { formatNumber } from '../../../../_common/filters/number';
import AppRealmFullCard from '../../../../_common/realm/AppRealmFullCard.vue';
import { createAppRoute, defineAppRouteOptions } from '../../../../_common/route/route-component';
import { Screen } from '../../../../_common/screen/screen-service';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import AppUserCard from '../../../../_common/user/card/AppUserCard.vue';
import { ActivityFeedService } from '../../../components/activity/feed/feed-service';
import { ActivityFeedView } from '../../../components/activity/feed/view';
import AppGameGrid from '../../../components/game/grid/grid.vue';
import AppGameList from '../../../components/game/list/list.vue';
import { AppActivityFeedLazy as AppActivityFeed } from '../../../components/lazy';
import AppPageContainer from '../../../components/page-container/AppPageContainer.vue';
import { sendSearch } from '../../../components/search/search-service';
import { useSearchRouteController } from '../RouteSearch.vue';

export default {
	...defineAppRouteOptions({
		cache: true,
		resolver: ({ route }) => sendSearch(getQuery(route, 'q') ?? ''),
	}),
};
</script>

<script lang="ts" setup>
const route = useRoute();
const { processPayload, hasSearch, searchPayload, query } = useSearchRouteController()!;

const feed = ref(null) as Ref<ActivityFeedView | null>;

createAppRoute({
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
				url: `/web/posts/fetch/search/${encodeURIComponent(getQuery(route, 'q')!)}`,
				shouldShowFollow: true,
				itemsPerPage: payload.postsPerPage,
				shouldShowDates: false,
			},
			payload.posts,
			fromCache
		);
	},
});

const slicedUsers = computed(() =>
	Screen.isXs ? searchPayload.value.users : searchPayload.value.users.slice(0, 2)
);

const slicedCommunities = computed(() => searchPayload.value.communities.slice(0, 6));
</script>

<template>
	<section v-if="hasSearch">
		<template v-if="configRealms.value && searchPayload.realm">
			<section class="section section-thin">
				<div class="container">
					<h3 class="-heading">Realms</h3>

					<div class="-realm-cards">
						<AppRealmFullCard
							:realm="searchPayload.realm"
							:to="searchPayload.realm.routeLocation"
							overlay-content
							no-sheet
							no-follow
							label-position="bottom-left"
						/>
					</div>
				</div>
			</section>
		</template>

		<!-- Communities -->
		<template v-if="searchPayload.communities.length">
			<section class="section section-thin">
				<div class="container">
					<h3 class="-heading">
						<AppButton
							class="pull-right"
							trans
							:to="{ name: 'search.communities', query: { q: query } }"
						>
							<AppTranslate>View All</AppTranslate>
						</AppButton>

						<RouterLink
							class="link-unstyled"
							:to="{ name: 'search.communities', query: { q: query } }"
						>
							<AppTranslate>Communities</AppTranslate>
						</RouterLink>
						{{ ' ' }}
						<small>({{ formatNumber(searchPayload.communitiesCount) }})</small>
					</h3>

					<div class="scrollable-grid-xs">
						<div class="row">
							<div
								v-for="community of slicedCommunities"
								:key="community.id"
								class="scrollable-grid-item col-xs-5 col-sm-2"
							>
								<AppCommunityThumbnail :community="community" />
							</div>
						</div>
					</div>
				</div>
			</section>
		</template>

		<AppPageContainer no-left order="right,main">
			<!-- Games -->
			<template v-if="!Screen.isMobile && searchPayload.games.length" #right>
				<h3 class="-heading">
					<AppButton
						class="pull-right"
						trans
						:to="{ name: 'search.games', query: { q: query } }"
					>
						<AppTranslate>View All</AppTranslate>
					</AppButton>

					<RouterLink
						class="link-unstyled"
						:to="{ name: 'search.games', query: { q: query } }"
					>
						<AppTranslate>Games</AppTranslate>
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
						<AppTranslate>View all</AppTranslate>
					</RouterLink>
				</div>
			</template>

			<!-- Users -->
			<template v-if="searchPayload.users.length">
				<h3 class="-heading">
					<AppButton
						class="pull-right"
						trans
						:to="{ name: 'search.users', query: { q: query } }"
					>
						<AppTranslate>View All</AppTranslate>
					</AppButton>

					<RouterLink
						class="link-unstyled"
						:to="{ name: 'search.users', query: { q: query } }"
					>
						<AppTranslate>Users</AppTranslate>
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
					<AppTranslate>Posts</AppTranslate>
				</h3>

				<AppActivityFeed :feed="feed" show-ads />
			</template>
		</AppPageContainer>
	</section>
</template>

<style lang="stylus" scoped>
.-heading
	clearfix()
	margin-top: $line-height-computed

.-realm-cards
	display: grid
	--grid-cols: 4
	gap: 24px
	grid-template-columns: repeat(var(--grid-cols), 1fr)
	justify-content: center

	@media $media-sm
		--grid-cols: 3
		gap: 24px

	@media $media-xs
		--grid-cols: 2
		gap: 16px
</style>
