import VueRouter from 'vue-router';
import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./devlog.html';

import { FiresidePost } from '../../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { ActivityFeedContainer } from '../../../../../components/activity/feed/feed-container-service';
import { RouteState, RouteStore } from '../manage.store';
import { Api } from '../../../../../../lib/gj-lib-client/components/api/api.service';
import { AppActivityFeed } from '../../../../../components/activity/feed/feed';
import { AppDevlogPostAdd } from '../../../../../components/devlog/post/add/add';
import { AppGamePerms } from '../../../../../components/game/perms/perms';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../../../lib/gj-lib-client/components/route/route-component';

@View
@Component({
	name: 'RouteDashGamesManageDevlog',
	components: {
		AppActivityFeed,
		AppDevlogPostAdd,
		AppGamePerms,
	},
})
export default class RouteDashGamesManageDevlog extends BaseRouteComponent {
	@Prop(String) tab: 'draft' | undefined;

	@RouteState game: RouteStore['game'];

	feed: ActivityFeedContainer = null as any;

	get _tab() {
		return this.tab || 'active';
	}

	@RouteResolve({ cache: false, lazy: false })
	routeResolve(this: undefined, route: VueRouter.Route) {
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

	routed() {
		// Create a new activity feed container each time. Don't cache anything.
		this.feed = new ActivityFeedContainer(FiresidePost.populate(this.$payload.posts), {
			type: 'EventItem',
			url: `/web/dash/developer/games/devlog/posts/${this.game.id}/${this._tab}`,
		});
	}

	onPostAdded(post: FiresidePost) {
		// If they added into a different status, then switch tabs.
		if (this._tab !== post.status) {
			this.gotoPost(post);
			return;
		}

		this.feed.prepend([post]);
	}

	onPostEdited(post: FiresidePost) {
		this.gotoPost(post);
	}

	onPostPublished(post: FiresidePost) {
		this.gotoPost(post);
	}

	onPostRemoved(post: FiresidePost) {
		this.feed.remove(post);
	}

	private gotoPost(post: FiresidePost) {
		const tab = post.status === 'active' ? null : post.status;
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
