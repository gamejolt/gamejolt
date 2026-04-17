<script lang="ts">
import { computed, Ref, ref, toRef } from 'vue';
import { RouteLocationNormalized, RouterLink, useRoute, useRouter } from 'vue-router';

import AppActivityFeed from '~app/components/activity/feed/AppActivityFeed.vue';
import AppActivityFeedPlaceholder from '~app/components/activity/feed/AppActivityFeedPlaceholder.vue';
import { ActivityFeedService } from '~app/components/activity/feed/feed-service';
import { ActivityFeedView } from '~app/components/activity/feed/view';
import AppGamePerms from '~app/components/game/perms/AppGamePerms.vue';
import AppPostAddButton from '~app/components/post/add-button/AppPostAddButton.vue';
import { useGameDashRouteController } from '~app/views/dashboard/games/manage/manage.store';
import { Api } from '~common/api/api.service';
import { EventItemModel } from '~common/event-item/event-item.model';
import { FiresidePostModel } from '~common/fireside/post/post-model';
import AppNavTabList from '~common/nav/tab-list/AppNavTabList.vue';
import { createAppRoute, defineAppRouteOptions } from '~common/route/route-component';
import { $gettext } from '~common/translate/translate.service';

function getFetchUrl(route: RouteLocationNormalized) {
	const tab = route.query.tab || 'active';
	return `/web/posts/fetch/game/${route.params.id}?tab=${tab}`;
}

export default {
	...defineAppRouteOptions({
		cache: false,
		lazy: false,
		reloadOn: { query: ['tab', 'feed_last_id'] },
		resolver: ({ route }) =>
			Api.sendRequest(ActivityFeedService.makeFeedUrl(route, getFetchUrl(route))),
	}),
};
</script>

<script lang="ts" setup>
const route = useRoute();
const router = useRouter();
const { game } = useGameDashRouteController()!;

const feed = ref(null) as Ref<ActivityFeedView | null>;
const tab = toRef(() => route.query.tab || 'active');
const isBootstrapped = ref(false);

function onPostAdded(post: FiresidePostModel) {
	ActivityFeedService.onPostAdded({
		feed: feed.value!,
		post,
		appRoute: appRoute,
		route: route,
		router: router,
	});
}

function onPostEdited(eventItem: EventItemModel) {
	ActivityFeedService.onPostEdited({
		eventItem,
		appRoute: appRoute,
		route: route,
		router: router,
	});
}

function onPostPublished(eventItem: EventItemModel) {
	ActivityFeedService.onPostPublished({
		eventItem,
		appRoute: appRoute,
		route: route,
		router: router,
	});
}

const appRoute = createAppRoute({
	routeTitle: computed(() => $gettext('Manage Devlog')),
	onInit() {
		feed.value = ActivityFeedService.routeInit(isBootstrapped.value);
	},
	onResolved({ payload, fromCache }) {
		isBootstrapped.value = true;
		feed.value = ActivityFeedService.routed(
			feed.value,
			{
				type: 'EventItem',
				name: 'game-devlog',
				url: getFetchUrl(route),
				itemsPerPage: payload.perPage,
			},
			payload.items,
			fromCache
		);
	},
});
</script>

<template>
	<template v-if="isBootstrapped">
		<section class="section">
			<div class="gj-container">
				<div class="row">
					<div class="col-sm-10 col-md-8 col-lg-7 col-centered">
						<AppGamePerms :game="game" required="devlogs">
							<AppPostAddButton :game="game" @add="onPostAdded" />
						</AppGamePerms>

						<AppNavTabList>
							<ul>
								<li>
									<RouterLink
										:to="{
											name: 'dash.games.manage.devlog',
											query: {},
										}"
										:class="{
											active: tab === 'active',
										}"
									>
										{{ $gettext(`Posts`) }}
									</RouterLink>
								</li>
								<li>
									<RouterLink
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
										{{ $gettext(`Draft Posts`) }}
									</RouterLink>
								</li>
								<li>
									<RouterLink
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
										{{ $gettext(`Scheduled Posts`) }}
									</RouterLink>
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
										{{ $gettext(`You haven't published any posts yet.`) }}
									</p>
								</template>
								<template v-else-if="tab === 'draft'">
									<p>
										{{ $gettext(`You don't have any draft posts.`) }}
									</p>
								</template>
								<template v-else-if="tab === 'scheduled'">
									<p>
										{{ $gettext(`You don't have any scheduled posts.`) }}
									</p>
								</template>
							</div>
						</template>
					</div>
				</div>
			</div>
		</section>
	</template>
</template>
