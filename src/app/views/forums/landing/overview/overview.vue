<script lang="ts">
import { Options } from 'vue-property-decorator';
import { Api } from '../../../../../_common/api/api.service';
import { ForumCategory } from '../../../../../_common/forum/category/category.model';
import { ForumChannel } from '../../../../../_common/forum/channel/channel.model';
import { ForumPost } from '../../../../../_common/forum/post/post.model';
import {
	LegacyRouteComponent,
	OptionsForLegacyRoute,
} from '../../../../../_common/route/legacy-route-component';
import AppForumChannelList from '../../../../components/forum/channel-list/channel-list.vue';
import AppForumRules from '../../../../components/forum/rules/rules.vue';

@Options({
	name: 'RouteForumsLandingOverview',
	components: {
		AppForumRules,
		AppForumChannelList,
	},
})
@OptionsForLegacyRoute({
	cache: true,
	deps: {},
	resolver: () => Api.sendRequest('/web/forums'),
})
export default class RouteForumsLandingOverview extends LegacyRouteComponent {
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
</script>

<template>
	<section class="section">
		<div class="container">
			<AppForumRules />

			<div v-for="category of categories" :key="category.id">
				<div class="forum-section-header">
					<h2 :id="`category-${category.url}`" class="sans-margin">
						{{ category.title }}
					</h2>
				</div>

				<AppForumChannelList
					:category="category"
					:channels="groupedChannels[category.id]"
					:latest-posts="latestPosts"
					:post-count-per-page="postCountPerPage"
				/>
			</div>
		</div>
	</section>
</template>
