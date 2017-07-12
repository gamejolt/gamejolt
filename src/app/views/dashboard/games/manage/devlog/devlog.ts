import Vue from 'vue';
import VueRouter from 'vue-router';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./devlog.html';

import { RouteResolve } from '../../../../../../lib/gj-lib-client/utils/router';
import { Meta } from '../../../../../../lib/gj-lib-client/components/meta/meta-service';
import { FiresidePost } from '../../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { ActivityFeedService } from '../../../../../components/activity/feed/feed-service';
import { ActivityFeedContainer } from '../../../../../components/activity/feed/feed-container-service';
import { RouteState, RouteStore } from '../manage.state';
import { Api } from '../../../../../../lib/gj-lib-client/components/api/api.service';
import { AppActivityFeed } from '../../../../../components/activity/feed/feed';
import { AppDevlogPostAdd } from '../../../../../components/devlog/post/add/add';

@View
@Component({
	components: {
		AppActivityFeed,
		AppDevlogPostAdd,
	},
})
export default class RouteDashGamesManageDevlog extends Vue {
	@Prop([String])
	tab: 'draft' | undefined;

	@RouteState game: RouteStore['game'];

	feed: ActivityFeedContainer = null as any;

	get _tab() {
		return this.tab || 'active';
	}

	@RouteResolve()
	routeResolve(this: undefined, route: VueRouter.Route) {
		return Api.sendRequest(
			'/web/dash/developer/games/devlog/posts/' +
				route.params.id +
				'/' +
				route.params.tab || 'active'
		);
	}

	routeInit() {
		Meta.title = this.$gettext('Manage Devlog');
	}

	routed() {
		this.feed = ActivityFeedService.bootstrap(
			FiresidePost.populate(this.$payload.posts),
			{
				type: 'Fireside_Post',
				url: `/web/dash/developer/games/devlog/posts/${this.game.id}/${this
					._tab}`,
			}
		)!;
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

	private gotoPost(post: FiresidePost) {
		const tab = post.status === 'active' ? undefined : post.status;

		this.$router.replace({
			name: this.$route.name,
			params: Object.assign({}, this.$route.params, { tab }),
		});
	}
}
