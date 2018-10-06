import View from '!view!./overview.html';
import { Component } from 'vue-property-decorator';
import { Api } from '../../../../../lib/gj-lib-client/components/api/api.service';
import { ForumCategory } from '../../../../../lib/gj-lib-client/components/forum/category/category.model';
import { ForumChannel } from '../../../../../lib/gj-lib-client/components/forum/channel/channel.model';
import { ForumPost } from '../../../../../lib/gj-lib-client/components/forum/post/post.model';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../../lib/gj-lib-client/components/route/route-component';
import { AppForumChannelList } from '../../../../components/forum/channel-list/channel-list';
import { AppForumRules } from '../../../../components/forum/rules/rules';

@View
@Component({
	name: 'RouteForumsLandingOverview',
	components: {
		AppForumRules,
		AppForumChannelList,
	},
})
export default class RouteForumsLandingOverview extends BaseRouteComponent {
	categories: ForumCategory[] = [];
	groupedChannels: { [k: number]: ForumChannel[] } = {};
	latestPosts: ForumPost[] = [];
	postCountPerPage = 0;

	@RouteResolve({
		cache: true,
		deps: {},
	})
	routeResolve(this: undefined) {
		return Api.sendRequest('/web/forums');
	}

	get routeTitle() {
		return this.$gettext('Forums');
	}

	routed($payload: any) {
		this.categories = ForumCategory.populate($payload.categories);
		this.latestPosts = ForumPost.populate($payload.latestPosts);
		this.postCountPerPage = $payload.postCountPerPage;

		this.groupedChannels = {};
		const channels = ForumChannel.populate($payload.channels);
		for (const channel of channels) {
			if (!this.groupedChannels[channel.category.id]) {
				this.groupedChannels[channel.category.id] = [];
			}

			this.groupedChannels[channel.category.id].push(channel);
		}
	}
}
