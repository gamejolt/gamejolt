import { Component } from 'vue-property-decorator';
import { Api } from '../../../../../_common/api/api.service';
import { ForumCategory } from '../../../../../_common/forum/category/category.model';
import { ForumChannel } from '../../../../../_common/forum/channel/channel.model';
import { ForumPost } from '../../../../../_common/forum/post/post.model';
import { BaseRouteComponent, RouteResolver } from '../../../../../_common/route/route-component';
import AppForumChannelList from '../../../../components/forum/channel-list/channel-list.vue';
import AppForumRules from '../../../../components/forum/rules/rules.vue';

@Component({
	name: 'RouteForumsLandingOverview',
	components: {
		AppForumRules,
		AppForumChannelList,
	},
})
@RouteResolver({
	cache: true,
	deps: {},
	resolver: () => Api.sendRequest('/web/forums'),
})
export default class RouteForumsLandingOverview extends BaseRouteComponent {
	categories: ForumCategory[] = [];
	groupedChannels: { [k: number]: ForumChannel[] } = {};
	latestPosts: ForumPost[] = [];
	postCountPerPage = 0;

	get routeTitle() {
		return this.$gettext('Forums');
	}

	routeResolved($payload: any) {
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
