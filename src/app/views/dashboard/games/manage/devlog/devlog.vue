<script lang="ts">
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import { RouteLocationNormalized } from 'vue-router';
import { Api } from '../../../../../../_common/api/api.service';
import { EventItemModel } from '../../../../../../_common/event-item/event-item.model';
import { FiresidePostModel } from '../../../../../../_common/fireside/post/post-model';
import AppNavTabList from '../../../../../../_common/nav/tab-list/AppNavTabList.vue';
import {
	LegacyRouteComponent,
	OptionsForLegacyRoute,
} from '../../../../../../_common/route/legacy-route-component';
import AppActivityFeedPlaceholder from '../../../../../components/activity/feed/AppActivityFeedPlaceholder.vue';
import { ActivityFeedService } from '../../../../../components/activity/feed/feed-service';
import { ActivityFeedView } from '../../../../../components/activity/feed/view';
import { AppGamePerms } from '../../../../../components/game/perms/perms';
import { AppActivityFeedLazy } from '../../../../../components/lazy';
import AppPostAddButton from '../../../../../components/post/add-button/AppPostAddButton.vue';
import AppShellPageBackdrop from '../../../../../components/shell/AppShellPageBackdrop.vue';
import { useGameDashRouteController } from '../manage.store';

function getFetchUrl(route: RouteLocationNormalized) {
	const tab = route.query.tab || 'active';
	return `/web/posts/fetch/game/${route.params.id}?tab=${tab}`;
}

@Options({
	name: 'RouteDashGamesManageDevlog',
	components: {
		AppActivityFeed: AppActivityFeedLazy,
		AppActivityFeedPlaceholder,
		AppPostAddButton,
		AppGamePerms,
		AppNavTabList,
		AppShellPageBackdrop,
	},
})
@OptionsForLegacyRoute({
	cache: false,
	lazy: false,
	deps: { query: ['tab', 'feed_last_id'] },
	resolver: ({ route }) =>
		Api.sendRequest(ActivityFeedService.makeFeedUrl(route, getFetchUrl(route))),
})
export default class RouteDashGamesManageDevlog extends LegacyRouteComponent {
	routeStore = setup(() => useGameDashRouteController()!);

	get game() {
		return this.routeStore.game!;
	}

	feed: ActivityFeedView | null = null;

	get tab() {
		return this.$route.query.tab || 'active';
	}

	get routeTitle() {
		return this.$gettext('Manage Devlog');
	}

	routeCreated() {
		this.feed = ActivityFeedService.routeInit(this.isRouteBootstrapped);
	}

	routeResolved($payload: any, fromCache: boolean) {
		this.feed = ActivityFeedService.routed(
			this.feed,
			{
				type: 'EventItem',
				name: 'game-devlog',
				url: getFetchUrl(this.$route),
				itemsPerPage: $payload.perPage,
			},
			$payload.items,
			fromCache
		);
	}

	onPostAdded(post: FiresidePostModel) {
		ActivityFeedService.onPostAdded({
			feed: this.feed!,
			post,
			appRoute: this.appRoute_,
			route: this.$route,
			router: this.$router,
		});
	}

	onPostEdited(eventItem: EventItemModel) {
		ActivityFeedService.onPostEdited({
			eventItem,
			appRoute: this.appRoute_,
			route: this.$route,
			router: this.$router,
		});
	}

	onPostPublished(eventItem: EventItemModel) {
		ActivityFeedService.onPostPublished({
			eventItem,
			appRoute: this.appRoute_,
			route: this.$route,
			router: this.$router,
		});
	}
}
</script>

<template>
	<AppShellPageBackdrop v-if="isRouteBootstrapped">
		<section class="section">
			<div class="container">
				<div class="row">
					<div class="col-sm-10 col-md-8 col-lg-7 col-centered">
						<AppGamePerms :game="game" required="devlogs">
							<AppPostAddButton :game="game" @add="onPostAdded" />
						</AppGamePerms>

						<AppNavTabList>
							<ul>
								<li>
									<router-link
										:to="{
											name: 'dash.games.manage.devlog',
											query: {},
										}"
										:class="{
											active: tab === 'active',
										}"
									>
										<AppTranslate>Posts</AppTranslate>
									</router-link>
								</li>
								<li>
									<router-link
										:to="{
											name: 'dash.games.manage.devlog',
											query: {
												tab: 'draft',
											},
										}"
										:class="{
											active: tab === 'draft',
										}"
									>
										<AppTranslate>Draft Posts</AppTranslate>
									</router-link>
								</li>
								<li>
									<router-link
										:to="{
											name: 'dash.games.manage.devlog',
											query: {
												tab: 'scheduled',
											},
										}"
										:class="{
											active: tab === 'scheduled',
										}"
									>
										<AppTranslate>Scheduled Posts</AppTranslate>
									</router-link>
								</li>
							</ul>
						</AppNavTabList>

						<AppActivityFeedPlaceholder v-if="!feed || !feed.isBootstrapped" />
						<template v-else>
							<AppActivityFeed
								v-if="feed.hasItems"
								:feed="feed"
								@edit-post="onPostEdited"
								@publish-post="onPostPublished"
							/>
							<div v-else class="alert">
								<template v-if="tab === 'active'">
									<p>
										<AppTranslate>
											You haven't published any posts yet.
										</AppTranslate>
									</p>
								</template>
								<template v-else-if="tab === 'draft'">
									<p>
										<AppTranslate>You don't have any draft posts.</AppTranslate>
									</p>
								</template>
								<template v-else-if="tab === 'scheduled'">
									<p>
										<AppTranslate>
											You don't have any scheduled posts.
										</AppTranslate>
									</p>
								</template>
							</div>
						</template>
					</div>
				</div>
			</div>
		</section>
	</AppShellPageBackdrop>
</template>
