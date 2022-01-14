<script lang="ts">
import { Options } from 'vue-property-decorator';
import { RouteLocationNormalized } from 'vue-router';
import { Api } from '../../../../../../_common/api/api.service';
import { EventItem } from '../../../../../../_common/event-item/event-item.model';
import { FiresidePost } from '../../../../../../_common/fireside/post/post-model';
import AppNavTabList from '../../../../../../_common/nav/tab-list/tab-list.vue';
import { BaseRouteComponent, RouteResolver } from '../../../../../../_common/route/route-component';
import { ActivityFeedService } from '../../../../../components/activity/feed/feed-service';
import AppActivityFeedPlaceholder from '../../../../../components/activity/feed/placeholder/placeholder.vue';
import { ActivityFeedView } from '../../../../../components/activity/feed/view';
import { AppGamePerms } from '../../../../../components/game/perms/perms';
import { AppActivityFeedLazy } from '../../../../../components/lazy';
import AppPostAddButton from '../../../../../components/post/add-button/add-button.vue';
import { RouteStore, RouteStoreModule } from '../manage.store';

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
	},
})
@RouteResolver({
	cache: false,
	lazy: false,
	deps: { query: ['tab', 'feed_last_id'] },
	resolver: ({ route }) =>
		Api.sendRequest(ActivityFeedService.makeFeedUrl(route, getFetchUrl(route))),
})
export default class RouteDashGamesManageDevlog extends BaseRouteComponent {
	@RouteStoreModule.State
	game!: RouteStore['game'];

	feed: ActivityFeedView | null = null;

	get tab() {
		return this.$route.query.tab || 'active';
	}

	get routeTitle() {
		return this.$gettext('Manage Devlog');
	}

	routeCreated() {
		this.feed = ActivityFeedService.routeInit(this);
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

	onPostAdded(post: FiresidePost) {
		ActivityFeedService.onPostAdded(this.feed!, post, this);
	}

	onPostEdited(eventItem: EventItem) {
		ActivityFeedService.onPostEdited(eventItem, this);
	}

	onPostPublished(eventItem: EventItem) {
		ActivityFeedService.onPostPublished(eventItem, this);
	}

	onPostRemoved(eventItem: EventItem) {
		ActivityFeedService.onPostRemoved(eventItem, this);
	}
}
</script>

<template>
	<div v-if="isRouteBootstrapped">
		<section class="section fill-backdrop">
			<div class="container">
				<div class="row">
					<div class="col-sm-10 col-md-8 col-lg-7 col-centered">
						<app-game-perms :game="game" required="devlogs">
							<app-post-add-button :game="game" @add="onPostAdded" />
						</app-game-perms>

						<app-nav-tab-list>
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
										<translate>Posts</translate>
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
										<translate>Draft Posts</translate>
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
										<translate>Scheduled Posts</translate>
									</router-link>
								</li>
							</ul>
						</app-nav-tab-list>

						<app-activity-feed-placeholder v-if="!feed || !feed.isBootstrapped" />
						<template v-else>
							<app-activity-feed
								v-if="feed.hasItems"
								:feed="feed"
								@edit-post="onPostEdited"
								@publish-post="onPostPublished"
								@remove-post="onPostRemoved"
							/>
							<div v-else class="alert">
								<template v-if="tab === 'active'">
									<p>
										<translate>You haven't published any posts yet.</translate>
									</p>
								</template>
								<template v-else-if="tab === 'draft'">
									<p><translate>You don't have any draft posts.</translate></p>
								</template>
								<template v-else-if="tab === 'scheduled'">
									<p>
										<translate>You don't have any scheduled posts.</translate>
									</p>
								</template>
							</div>
						</template>
					</div>
				</div>
			</div>
		</section>
	</div>
</template>
