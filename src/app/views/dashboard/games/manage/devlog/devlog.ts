import View from '!view!./devlog.html';
import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import { FiresidePost } from 'game-jolt-frontend-lib/components/fireside/post/post-model';
import { AppNavTabList } from 'game-jolt-frontend-lib/components/nav/tab-list/tab-list';
import {
	BaseRouteComponent,
	RouteResolve,
} from 'game-jolt-frontend-lib/components/route/route-component';
import { Component, Prop } from 'vue-property-decorator';
import { Route } from 'vue-router';
import { AppActivityFeed } from '../../../../../components/activity/feed/feed';
import { ActivityFeedContainer } from '../../../../../components/activity/feed/feed-container-service';
import { AppDevlogPostAddButton } from '../../../../../components/devlog/post/add-button/add-button';
import { AppGamePerms } from '../../../../../components/game/perms/perms';
import { RouteState, RouteStore } from '../manage.store';

@View
@Component({
	name: 'RouteDashGamesManageDevlog',
	components: {
		AppActivityFeed,
		AppDevlogPostAddButton,
		AppGamePerms,
		AppNavTabList,
	},
})
export default class RouteDashGamesManageDevlog extends BaseRouteComponent {
	@Prop(String)
	tab!: 'draft' | 'scheduled' | undefined;

	@RouteState
	game!: RouteStore['game'];

	feed: ActivityFeedContainer = null as any;

	get _tab() {
		return this.tab || 'active';
	}

	@RouteResolve({ cache: false, lazy: false })
	routeResolve(this: undefined, route: Route) {
		return Api.sendRequest(
			'/web/dash/developer/games/devlog/posts/' +
				route.params.id +
				'/' +
				(route.params.tab || 'active')
		);
	}

	get routeTitle() {
		return this.$gettext('Manage Devlog');
	}

	routed($payload: any) {
		// Create a new activity feed container each time. Don't cache anything.
		this.feed = new ActivityFeedContainer(FiresidePost.populate($payload.posts), {
			type: 'EventItem',
			url: `/web/dash/developer/games/devlog/posts/${this.game.id}/${this._tab}`,
		});
	}

	getTabForPost(post: FiresidePost) {
		if (post.isScheduled) {
			return 'scheduled';
		} else if (post.isDraft) {
			return 'draft';
		} else {
			// null = active
			return null;
		}
	}

	onPostAdded(post: FiresidePost) {
		this.gotoPost(post);
		this.feed.prepend([post]);
	}

	onPostEdited(post: FiresidePost) {
		this.gotoPost(post);
	}

	onPostPublished(post: FiresidePost) {
		this.gotoPost(post);
	}

	onPostRemoved(_post: FiresidePost) {
		// do nothing
	}

	private gotoPost(post: FiresidePost) {
		const tab = this.getTabForPost(post);

		// We always reload the scheduled posts page. Since it works based on a date that can change
		// we need to refresh the feed to properly sort everything agian.
		if (tab !== 'scheduled' && this._tab === tab) {
			return;
		}

		const location = {
			name: this.$route.name,
			params: Object.assign({}, this.$route.params, { tab }),
		};

		if (this.$router.resolve(location).href === this.$route.fullPath) {
			this.reloadRoute();
		} else {
			this.$router.replace(location);
		}
	}
}
