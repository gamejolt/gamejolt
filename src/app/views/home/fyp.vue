<script lang="ts">
import { Inject, Options } from 'vue-property-decorator';
import { Api } from '../../../_common/api/api.service';
import { BaseRouteComponent, RouteResolver } from '../../../_common/route/route-component';
import { ActivityFeedService } from '../../components/activity/feed/feed-service';
import AppActivityFeedPlaceholder from '../../components/activity/feed/placeholder/placeholder.vue';
import { AppActivityFeedLazy } from '../../components/lazy';
import { RouteActivityFeedController } from './feed';

@Options({
	name: 'RouteHomeFYP',
	components: {
		AppActivityFeed: AppActivityFeedLazy,
		AppActivityFeedPlaceholder,
	},
})
@RouteResolver({
	cache: true,
	lazy: true,
	resolver: ({ route }) =>
		Api.sendRequest(ActivityFeedService.makeFeedUrl(route, '/web/posts/for-you')),
})
export default class RouteHomeFYP extends BaseRouteComponent {
	@Inject({ from: 'route-activity-feed' })
	controller!: RouteActivityFeedController;

	get feed() {
		return this.controller.feed;
	}

	routeCreated() {
		this.controller.feed = ActivityFeedService.routeInit(this);
	}

	routeResolved($payload: any, fromCache: boolean) {
		this.controller.feed = ActivityFeedService.routed(
			this.feed,
			{
				type: 'EventItem',
				name: 'fyp',
				url: `/web/posts/for-you`,
				shouldShowFollow: true,
				shouldShowDates: false,
				itemsPerPage: $payload.perPage,
				suppressTicks: $payload.suppressTicks,
			},
			$payload.items,
			fromCache
		);
	}

	onLoadMore() {
		// Log as a proper event.
		// Analytics.trackEvent(undefined, true);
	}
}
</script>

<template>
	<div>
		<app-activity-feed-placeholder v-if="!feed || !feed.isBootstrapped" />
		<div v-else>
			<div v-if="!feed.hasItems" class="alert full-bleed-xs text-center">
				<p class="lead">
					<translate>
						You need to join some active communities for us to know your tastes.
					</translate>
				</p>

				<router-link
					v-app-track-event="`activity:main-menu:fyp-discover`"
					:to="{
						name: 'discover.communities',
					}"
				>
					<app-button icon="compass-needle" solid lg>
						<translate>Browse Communities</translate>
					</app-button>
				</router-link>
			</div>
			<app-activity-feed v-else :feed="feed" @load-more="onLoadMore" />
		</div>
	</div>
</template>
