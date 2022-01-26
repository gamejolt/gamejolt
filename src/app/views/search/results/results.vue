<script lang="ts">
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import AppCommunityThumbnail from '../../../../_common/community/thumbnail/thumbnail.vue';
import { formatNumber } from '../../../../_common/filters/number';
import { BaseRouteComponent, RouteResolver } from '../../../../_common/route/route-component';
import { Screen } from '../../../../_common/screen/screen-service';
import AppUserCard from '../../../../_common/user/card/card.vue';
import { ActivityFeedService } from '../../../components/activity/feed/feed-service';
import AppActivityFeedPlaceholder from '../../../components/activity/feed/placeholder/placeholder.vue';
import { ActivityFeedView } from '../../../components/activity/feed/view';
import AppGameGrid from '../../../components/game/grid/grid.vue';
import AppGameList from '../../../components/game/list/list.vue';
import { AppActivityFeedLazy } from '../../../components/lazy';
import AppPageContainer from '../../../components/page-container/page-container.vue';
import { Search, sendSearch } from '../../../components/search/search-service';
import { useSearchRouteController } from '../search.vue';

@Options({
	name: 'RouteSearchResults',
	components: {
		AppPageContainer,
		AppUserCard,
		AppGameList,
		AppGameGrid,
		AppCommunityThumbnail,
		AppActivityFeed: AppActivityFeedLazy,
		AppActivityFeedPlaceholder,
	},
})
@RouteResolver({
	resolver: ({ route }) => sendSearch(route.query.q + ''),
})
export default class RouteSearchResults extends BaseRouteComponent {
	routeStore = setup(() => useSearchRouteController()!);

	feed: ActivityFeedView | null = null;

	readonly Search = Search;
	readonly Screen = Screen;
	readonly formatNumber = formatNumber;

	get hasSearch() {
		return this.routeStore.hasSearch;
	}

	get searchPayload() {
		return this.routeStore.searchPayload;
	}

	get query() {
		return this.routeStore.query;
	}

	get slicedUsers() {
		return Screen.isXs ? this.searchPayload.users : this.searchPayload.users.slice(0, 2);
	}

	get slicedCommunities() {
		return this.searchPayload.communities.slice(0, 6);
	}

	routeResolved(payload: any, fromCache: boolean) {
		this.routeStore.processPayload({ payload, route: this.$route });

		// We bootstrap the feed from cache in the routeResolved method since
		// this page is not cached or lazy. We need this to get called after we
		// resolve the store with data.
		this.feed = ActivityFeedService.routeInit(this);
		this.feed = ActivityFeedService.routed(
			this.feed,
			{
				type: 'EventItem',
				name: 'search',
				url: `/web/posts/fetch/search/${encodeURIComponent(this.$route.query.q + '')}`,
				shouldShowFollow: true,
				itemsPerPage: payload.postsPerPage,
				shouldShowDates: false,
			},
			payload.posts,
			fromCache
		);
	}
}
</script>

<template>
	<section v-if="hasSearch">
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

						<router-link
							class="link-unstyled"
							:to="{ name: 'search.communities', query: { q: query } }"
						>
							<AppTranslate>Communities</AppTranslate>
						</router-link>
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

					<router-link
						class="link-unstyled"
						:to="{ name: 'search.games', query: { q: query } }"
					>
						<AppTranslate>search.results.games_heading</AppTranslate>
					</router-link>
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
					<router-link
						class="link-muted"
						:to="{ name: 'search.games', query: { q: query } }"
					>
						<AppTranslate>View all</AppTranslate>
					</router-link>
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

					<router-link
						class="link-unstyled"
						:to="{ name: 'search.users', query: { q: query } }"
					>
						<AppTranslate>search.results.users_heading</AppTranslate>
					</router-link>
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

				<AppActivityFeed :feed="feed" />
			</template>
		</AppPageContainer>
	</section>
</template>

<style lang="stylus" scoped>
.-heading
	clearfix()
	margin-top: $line-height-computed
</style>
