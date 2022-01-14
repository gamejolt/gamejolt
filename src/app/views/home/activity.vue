<script lang="ts">
import { setup } from 'vue-class-component';
import { Inject, Options, Watch } from 'vue-property-decorator';
import { Api } from '../../../_common/api/api.service';
import { BaseRouteComponent, RouteResolver } from '../../../_common/route/route-component';
import { ActivityFeedService } from '../../components/activity/feed/feed-service';
import AppActivityFeedPlaceholder from '../../components/activity/feed/placeholder/placeholder.vue';
import { AppActivityFeedLazy } from '../../components/lazy';
import { useAppStore } from '../../store';
import { RouteActivityFeedController } from './feed';

@Options({
	name: 'RouteHomeActivity',
	components: {
		AppActivityFeed: AppActivityFeedLazy,
		AppActivityFeedPlaceholder,
	},
})
@RouteResolver({
	cache: true,
	lazy: true,
	resolver: ({ route }) =>
		Api.sendRequest(ActivityFeedService.makeFeedUrl(route, '/web/dash/activity/activity')),
})
export default class RouteHomeActivity extends BaseRouteComponent {
	store = setup(() => useAppStore());

	@Inject({ from: 'route-activity-feed' })
	controller!: RouteActivityFeedController;

	get grid() {
		return this.store.grid;
	}
	get unreadActivityCount() {
		return this.store.unreadActivityCount;
	}

	get feed() {
		return this.controller.feed;
	}

	@Watch('unreadActivityCount', { immediate: true })
	onUnreadActivityCountChanged() {
		if (this.feed && this.unreadActivityCount > this.feed.newCount) {
			this.feed.newCount = this.unreadActivityCount;
		}
	}

	routeCreated() {
		this.controller.feed = ActivityFeedService.routeInit(this);
	}

	routeResolved(payload: any, fromCache: boolean) {
		this.controller.feed = ActivityFeedService.routed(
			this.feed,
			{
				type: 'EventItem',
				name: 'activity',
				url: `/web/dash/activity/more/activity`,
				shouldShowFollow: true,
				notificationWatermark: payload.unreadWatermark,
				itemsPerPage: payload.perPage,
			},
			payload.items,
			fromCache
		);

		if (!fromCache) {
			this.grid?.pushViewNotifications('activity');
		}
	}

	onLoadedNew() {
		if (this.unreadActivityCount > 0) {
			this.grid?.pushViewNotifications('activity');
		}
	}

	onLoadMore() {
		// TODO: Log this as a proper event.
		// Analytics.trackEvent(undefined, true);
	}
}
</script>

<template>
	<app-activity-feed-placeholder v-if="!feed || !feed.isBootstrapped" />
	<div v-else>
		<div v-if="!feed.hasItems" class="alert full-bleed-xs text-center">
			<p class="lead">
				<translate>
					You don't have any activity yet. Follow games to stay up to date on their latest
					development!
				</translate>
			</p>

			<router-link
				v-app-track-event="`activity:main-menu:discover`"
				:to="{
					name: 'discover.home',
				}"
			>
				<app-button icon="compass-needle" solid lg>
					<translate>Explore</translate>
				</app-button>
			</router-link>
		</div>
		<app-activity-feed v-else :feed="feed" @load-new="onLoadedNew" @load-more="onLoadMore" />
	</div>
</template>
