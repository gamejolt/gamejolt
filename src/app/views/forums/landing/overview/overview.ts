import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import { ForumCategory } from 'game-jolt-frontend-lib/components/forum/category/category.model';
import { ForumChannel } from 'game-jolt-frontend-lib/components/forum/channel/channel.model';
import { ForumPost } from 'game-jolt-frontend-lib/components/forum/post/post.model';
import { BaseRouteComponent, RouteResolver } from 'game-jolt-frontend-lib/components/route/route-component';
import { Component } from 'vue-property-decorator';
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
