<script lang="ts">
import { computed, ref } from 'vue';

import AppForumTopicList from '~app/components/forum/topic-list/AppForumTopicList.vue';
import { Api } from '~common/api/api.service';
import { ForumTopicModel } from '~common/forum/topic/topic.model';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '~common/route/route-component';
import { $gettext } from '~common/translate/translate.service';

export default {
	...defineAppRouteOptions({
		cache: true,
		reloadOn: 'never',
		resolver: () => Api.sendRequest('/web/forums/active-topics'),
	}),
};
</script>

<script lang="ts" setup>
const topics = ref<ForumTopicModel[]>([]);
const postCountPerPage = ref(0);

createAppRoute({
	routeTitle: computed(() => $gettext(`Active Topics in All Forums`)),
	onResolved({ payload }) {
		topics.value = ForumTopicModel.populate(payload.topics);
		postCountPerPage.value = payload.postCountPerPage;
	},
});
</script>

<template>
	<div class="section">
		<div class="container">
			<div class="alert full-bleed-xs">
				<p>
					{{
						$gettext(
							`Some topics from all channels sorted by when they last had a post. Smell how fresh.`
						)
					}}
				</p>
			</div>
			<br />

			<AppForumTopicList
				:topics="(topics as any)"
				sort=""
				:use-upvotes="false"
				:post-count-per-page="postCountPerPage"
			/>
		</div>
	</div>
</template>
