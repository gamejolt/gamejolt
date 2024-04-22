<script lang="ts">
import { computed, ref } from 'vue';
import { Api } from '../../../../../_common/api/api.service';
import { ForumCategoryModel } from '../../../../../_common/forum/category/category.model';
import { ForumChannelModel } from '../../../../../_common/forum/channel/channel.model';
import { ForumPostModel } from '../../../../../_common/forum/post/post.model';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '../../../../../_common/route/route-component';
import { $gettext } from '../../../../../_common/translate/translate.service';
import AppForumChannelList from '../../../../components/forum/channel-list/channel-list.vue';
import AppForumRules from '../../../../components/forum/rules/rules.vue';

export default {
	...defineAppRouteOptions({
		cache: true,
		reloadOn: 'never',
		resolver: () => Api.sendRequest('/web/forums'),
	}),
};
</script>

<script lang="ts" setup>
const categories = ref<ForumCategoryModel[]>([]);
const latestPosts = ref<ForumPostModel[]>([]);
const groupedChannels = ref<{ [k: number]: ForumChannelModel[] }>({});
const postCountPerPage = ref(0);

createAppRoute({
	routeTitle: computed(() => $gettext('Forums')),
	onResolved({ payload }) {
		categories.value = ForumCategoryModel.populate(payload.categories);
		latestPosts.value = ForumPostModel.populate(payload.latestPosts);
		postCountPerPage.value = payload.postCountPerPage;

		groupedChannels.value = {};
		const channels = ForumChannelModel.populate(payload.channels);
		for (const channel of channels) {
			if (!groupedChannels.value[channel.category.id]) {
				groupedChannels.value[channel.category.id] = [];
			}

			groupedChannels.value[channel.category.id].push(channel);
		}
	},
});
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
