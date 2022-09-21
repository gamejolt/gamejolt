<script lang="ts">
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import { RouteLocationNormalized } from 'vue-router';
import { Api } from '../../../../../_common/api/api.service';
import { EventItem } from '../../../../../_common/event-item/event-item.model';
import { FiresidePost } from '../../../../../_common/fireside/post/post-model';
import AppIllustration from '../../../../../_common/illustration/AppIllustration.vue';
import AppNavTabList from '../../../../../_common/nav/tab-list/tab-list.vue';
import { BaseRouteComponent, OptionsForRoute } from '../../../../../_common/route/route-component';
import { useCommonStore } from '../../../../../_common/store/common-store';
import { vAppTooltip } from '../../../../../_common/tooltip/tooltip-directive';
import AppActivityFeedPlaceholder from '../../../../components/activity/feed/AppActivityFeedPlaceholder.vue';
import { ActivityFeedService } from '../../../../components/activity/feed/feed-service';
import { ActivityFeedView } from '../../../../components/activity/feed/view';
import { AppActivityFeedLazy } from '../../../../components/lazy';
import AppPostAddButton from '../../../../components/post/add-button/AppPostAddButton.vue';
import AppUserSpawnDay from '../../../../components/user/spawn-day/spawn-day.vue';
import { illNoComments } from '../../../../img/ill/illustrations';
import { useProfileRouteController } from '../../profile.vue';

function isLikeFeed(route: RouteLocationNormalized) {
	return route.params.feedSection === 'likes';
}

function getFetchUrl(route: RouteLocationNormalized) {
	const tab = route.query.tab || 'active';
	const feedType = isLikeFeed(route) ? 'user-likes' : 'user';
	return `/web/posts/fetch/${feedType}/@${route.params.username}?tab=${tab}`;
}

@Options({
	name: 'RouteProfileOverviewFeed',
	components: {
		AppActivityFeed: AppActivityFeedLazy,
		AppActivityFeedPlaceholder,
		AppNavTabList,
		AppPostAddButton,
		AppUserSpawnDay,
		AppIllustration,
	},
	directives: {
		AppTooltip: vAppTooltip,
	},
})
@OptionsForRoute({
	cache: false,
	lazy: true,
	deps: { params: ['feedSection'], query: ['tab', 'feed_last_id'] },
	resolver: ({ route }) =>
		Api.sendRequest(ActivityFeedService.makeFeedUrl(route, getFetchUrl(route)), undefined, {
			// Don't error redirect here. It would go to 404 if the user is banned, and prevent us
			// from showing the "This user is banned" page.
			noErrorRedirect: true,
		}),
})
export default class RouteProfileOverviewFeed extends BaseRouteComponent {
	routeStore = setup(() => useProfileRouteController()!);
	commonStore = setup(() => useCommonStore());

	feed: ActivityFeedView | null = null;

	readonly illNoComments = illNoComments;

	get app() {
		return this.commonStore;
	}

	get user() {
		return this.routeStore.user;
	}

	get tab() {
		if (this.$route.params.feedSection === 'likes') {
			return 'likes';
		}
		return this.$route.query.tab || 'active';
	}

	get isOwner() {
		return this.app.user && this.user?.id === this.app.user.id;
	}

	get isLikeFeed() {
		return isLikeFeed(this.$route);
	}

	get isLikeFeedDisabled() {
		return this.user?.liked_posts_enabled === false;
	}

	get likeFeedTooltip() {
		if (!this.isLikeFeedDisabled) {
			return null;
		}

		return this.isOwner
			? this.$gettext(`You've made your liked posts private, so only you can see this.`)
			: this.$gettext(`This user has made their liked posts private.`);
	}

	routeCreated() {
		this.feed = ActivityFeedService.routeInit(this.isRouteBootstrapped);
	}

	routeResolved(payload: any, fromCache: boolean) {
		this.feed = ActivityFeedService.routed(
			this.feed,
			{
				type: 'EventItem',
				name: 'user-profile',
				url: getFetchUrl(this.$route),
				itemsPerPage: payload.perPage,
				shouldShowDates: !this.isLikeFeed,
				shouldShowFollow: this.isLikeFeed,
			},
			payload.items,
			fromCache
		);
	}

	onPostAdded(post: FiresidePost) {
		ActivityFeedService.onPostAdded({
			feed: this.feed!,
			post,
			appRoute: this.appRoute_,
			route: this.$route,
			router: this.$router,
		});
	}

	onPostEdited(eventItem: EventItem) {
		ActivityFeedService.onPostEdited({
			eventItem,
			appRoute: this.appRoute_,
			route: this.$route,
			router: this.$router,
		});
	}

	onPostPublished(eventItem: EventItem) {
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
	<div>
		<!-- Spawn day -->
		<AppUserSpawnDay :user="user" @post-add="onPostAdded" />

		<AppPostAddButton v-if="isOwner" @add="onPostAdded" />

		<AppNavTabList>
			<ul>
				<li>
					<router-link
						:to="{
							name: 'profile.overview',
							query: {},
						}"
						:class="{
							active: tab === 'active',
						}"
					>
						<AppTranslate>Posts</AppTranslate>
					</router-link>
				</li>
				<li v-app-tooltip="likeFeedTooltip">
					<router-link
						:to="{
							name: 'profile.overview',
							query: {},
							params: { feedSection: 'likes' },
						}"
						:class="{
							active: tab === 'likes',
						}"
					>
						<AppTranslate>Likes</AppTranslate>
						<AppJolticon v-if="isLikeFeedDisabled" icon="subscribed" />
					</router-link>
				</li>
				<template v-if="isOwner">
					<li>
						<router-link
							:to="{
								name: 'profile.overview',
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
								name: 'profile.overview',
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
				</template>
			</ul>
		</AppNavTabList>

		<AppIllustration v-if="isLikeFeed && isLikeFeedDisabled && !isOwner" :asset="illNoComments">
			<p>
				<AppTranslate>This user has made their liked posts private.</AppTranslate>
			</p>
		</AppIllustration>
		<AppActivityFeedPlaceholder v-else-if="!feed || !feed.isBootstrapped" />
		<template v-else>
			<AppActivityFeed
				v-if="feed.hasItems"
				:feed="feed"
				show-ads
				@edit-post="onPostEdited"
				@publish-post="onPostPublished"
			/>
			<AppIllustration v-else :asset="illNoComments">
				<p>
					<template v-if="isOwner">
						<AppTranslate v-if="isLikeFeed">
							You haven't liked anything yet.
						</AppTranslate>
						<AppTranslate v-else>You haven't posted anything yet.</AppTranslate>
					</template>
					<template v-else>
						<AppTranslate v-if="isLikeFeed">
							This user hasn't liked anything yet.
						</AppTranslate>
						<AppTranslate v-else>This user hasn't posted anything yet.</AppTranslate>
					</template>
				</p>
			</AppIllustration>
		</template>
	</div>
</template>
