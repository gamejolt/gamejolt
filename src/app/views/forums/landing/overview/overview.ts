import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./overview.html';

import { Meta } from '../../../../../lib/gj-lib-client/components/meta/meta-service';
import { ForumCategory } from '../../../../../lib/gj-lib-client/components/forum/category/category.model';
import { ForumChannel } from '../../../../../lib/gj-lib-client/components/forum/channel/channel.model';
import { ForumPost } from '../../../../../lib/gj-lib-client/components/forum/post/post.model';
import { BeforeRouteEnter } from '../../../../../lib/gj-lib-client/utils/router';
import { Api } from '../../../../../lib/gj-lib-client/components/api/api.service';
import { AppForumRules } from '../../../../components/forum/rules/rules';
import { AppForumChannelList } from '../../../../components/forum/channel-list/channel-list';

@View
@Component({
	components: {
		AppForumRules,
		AppForumChannelList,
	},
})
export default class RouteForumsLandingOverview extends Vue {
	categories: ForumCategory[] = [];
	groupedChannels: { [k: number]: ForumChannel[] } = {};
	latestPosts: ForumPost[] = [];
	postCountPerPage = 0;

	created() {
		Meta.title = this.$gettext('Forums');
	}

	@BeforeRouteEnter({ cache: true })
	routeEnter() {
		return Api.sendRequest('/web/forums');
	}

	routed() {
		this.categories = ForumCategory.populate(this.$payload.categories);
		this.latestPosts = ForumPost.populate(this.$payload.latestPosts);
		this.postCountPerPage = this.$payload.postCountPerPage;

		this.groupedChannels = {};
		const channels = ForumChannel.populate(this.$payload.channels);
		for (const channel of channels) {
			if (!this.groupedChannels[channel.category.id]) {
				this.groupedChannels[channel.category.id] = [];
			}

			this.groupedChannels[channel.category.id].push(channel);
		}
	}
}
