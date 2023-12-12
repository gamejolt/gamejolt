<script lang="ts">
import { computed, ref } from 'vue';
import { Api } from '../../../../../_common/api/api.service';
import { ForumTopicModel } from '../../../../../_common/forum/topic/topic.model';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '../../../../../_common/route/route-component';
import { $gettext } from '../../../../../_common/translate/translate.service';
import AppForumTopicList from '../../../../components/forum/topic-list/topic-list.vue';

export default {
	...defineAppRouteOptions({
		cache: true,
		deps: {},
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

			<AppForumTopicList :topics="topics" :post-count-per-page="postCountPerPage" />
		</div>
	</div>
</template>
