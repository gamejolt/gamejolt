<script lang="ts">
import { computed, Ref, ref } from 'vue';
import { useRoute } from 'vue-router';

import { ActivityFeedService } from '~app/components/activity/feed/feed-service';
import { ActivityFeedView } from '~app/components/activity/feed/view';
import { AppActivityFeedLazy } from '~app/components/lazy';
import AppPostAddButton from '~app/components/post/add-button/AppPostAddButton.vue';
import { useRealmRouteStore } from '~app/views/realms/view/view.store';
import { Api } from '~common/api/api.service';
import { FiresidePostModel } from '~common/fireside/post/post-model';
import { createAppRoute, defineAppRouteOptions } from '~common/route/route-component';
import { $gettext } from '~common/translate/translate.service';

export default {
	...defineAppRouteOptions({
		reloadOn: { params: ['path'] },
		resolver: ({ route }) =>
			Promise.all([
				Api.sendRequest('/web/realms/' + route.params.path),
				Api.sendRequest(
					ActivityFeedService.makeFeedUrl(
						route,
						`/web/posts/fetch/realm/${route.params.path}`
					)
				),
			]),
	}),
};
</script>

<script lang="ts" setup>
const { realm, processPayload } = useRealmRouteStore();
const route = useRoute();

const feed = ref(null) as Ref<ActivityFeedView | null>;
const isBootstrapped = ref(false);

const appRoute = createAppRoute({
	routeTitle: computed(() =>
		realm.value
			? $gettext(`%{ realm } Realm - Art, videos, guides, polls and more`, {
					realm: realm.value.name,
				})
			: null
	),
	onInit() {
		feed.value = ActivityFeedService.routeInit(isBootstrapped.value);
	},
	onResolved({ payload, fromCache }) {
		const [realmPayload, feedPayload] = payload;
		isBootstrapped.value = true;

		processPayload(realmPayload);

		feed.value = ActivityFeedService.routed(
			feed.value,
			{
				type: 'EventItem',
				name: 'realm',
				url: `/web/posts/fetch/realm/${route.params.path}`,
				shouldShowFollow: true,
				itemsPerPage: feedPayload.perPage,
			},
			feedPayload.items,
			fromCache
		);
	},
});

function onPostAdded(post: FiresidePostModel) {
	ActivityFeedService.onPostAdded({
		feed: feed.value!,
		post,
		appRoute,
		route,
	});
}
</script>

<template>
	<div>
		<AppPostAddButton
			v-if="realm"
			:realm="realm"
			:placeholder="
				$gettext(`Post about %{ realm }!`, {
					realm: realm.name,
				})
			"
			@add="onPostAdded"
		/>

		<AppActivityFeedLazy v-if="feed?.isBootstrapped" :feed="feed" show-ads />
	</div>
</template>
