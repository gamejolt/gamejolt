import View from '!view!./feed.html';
import { Component } from 'vue-property-decorator';
import { Route } from 'vue-router';
import { State } from 'vuex-class';
import { Api } from '../../../../../lib/gj-lib-client/components/api/api.service';
import { EventItem } from '../../../../../lib/gj-lib-client/components/event-item/event-item.model';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../../lib/gj-lib-client/components/route/route-component';
import { AppActivityFeed } from '../../../../components/activity/feed/feed';
import { ActivityFeedContainer } from '../../../../components/activity/feed/feed-container-service';
import { ActivityFeedService } from '../../../../components/activity/feed/feed-service';
import { AppActivityFeedPlaceholder } from '../../../../components/activity/feed/placeholder/placeholder';
import { AppPostAddPopoverButton } from '../../../../components/post/add-popover-button/add-popover-button';
import { Store } from '../../../../store/index';
import { RouteState, RouteStore } from '../../profile.store';

@View
@Component({
	name: 'RouteProfileOverviewFeed',
	components: {
		AppActivityFeed,
		AppActivityFeedPlaceholder,
		AppPostAddPopoverButton,
	},
})
export default class RouteProfileOverviewFeed extends BaseRouteComponent {
	@State
	app!: Store['app'];

	@RouteState
	user!: RouteStore['user'];

	feed: ActivityFeedContainer | null = null;

	get isOwner() {
		return this.app.user && this.user && this.user.id === this.app.user.id;
	}

	get postsTab() {
		const sub = this.$route.params.sub;
		if (sub === 'draft-posts') {
			return 'draft';
		} else if (sub === 'scheduled-posts') {
			return 'scheduled';
		}
		return undefined;
	}

	@RouteResolve({ lazy: true })
	routeResolve(this: undefined, route: Route) {
		return Api.sendRequest('/web/profile/feed/@' + route.params.username);
	}

	routeInit() {
		// Try pulling feed from cache.
		this.feed = ActivityFeedService.bootstrap();
	}

	routed($payload: any, fromCache: boolean) {
		// This may have been bootstrapped from cache in the `bootstrapFeed`
		// mutation. If there was no cached feed, then we'll generate a new one.
		// Also regenerate if the game changed.
		if (!fromCache && !this.feed) {
			this.feed = ActivityFeedService.bootstrap(EventItem.populate($payload.items), {
				type: 'EventItem',
				url: `/web/profile/feed/@${this.$route.params.username}`,
			});
		}
	}
}
