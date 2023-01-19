<script lang="ts">
import { computed, Ref, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Api } from '../../../../../_common/api/api.service';
import { FiresidePost } from '../../../../../_common/fireside/post/post-model';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '../../../../../_common/route/route-component';
import { $gettextInterpolate } from '../../../../../_common/translate/translate.service';
import { ActivityFeedService } from '../../../../components/activity/feed/feed-service';
import { ActivityFeedView } from '../../../../components/activity/feed/view';
import { AppActivityFeedLazy } from '../../../../components/lazy';
import AppPostAddButton from '../../../../components/post/add-button/AppPostAddButton.vue';
import { useRealmRouteStore } from '../view.store';

export default {
	...defineAppRouteOptions({
		resolver: async ({ route }) =>
			Api.sendRequest(
				ActivityFeedService.makeFeedUrl(
					route,
					`/web/posts/fetch/realm/${route.params.path}`
				)
			),
	}),
};
</script>

<script lang="ts" setup>
const routeStore = useRealmRouteStore();
const router = useRouter();
const route = useRoute();

const feed = ref(null) as Ref<ActivityFeedView | null>;
const isBootstrapped = ref(false);

const appRoute = createAppRoute({
	routeTitle: computed(() =>
		routeStore.realm.value
			? $gettextInterpolate(`%{ realm } Realm - Art, videos, guides, polls and more`, {
					realm: routeStore.realm.value.name,
			  })
			: null
	),
	onInit() {
		feed.value = ActivityFeedService.routeInit(isBootstrapped.value);
	},
	onResolved({ payload, fromCache }) {
		isBootstrapped.value = true;

		feed.value = ActivityFeedService.routed(
			feed.value,
			{
				type: 'EventItem',
				name: 'realm',
				url: `/web/posts/fetch/realm/${route.params.path}`,
				shouldShowFollow: true,
				itemsPerPage: payload.perPage,
			},
			payload.items,
			fromCache
		);
	},
});

function onPostAdded(post: FiresidePost) {
	ActivityFeedService.onPostAdded({
		feed: feed.value!,
		post,
		appRoute: appRoute,
		route: route,
		router: router,
	});
}
</script>

<template>
	<div>
		<AppPostAddButton
			:realm="routeStore.realm.value"
			:placeholder="
				$gettextInterpolate(`Post about %{ realm }!`, {
					realm: routeStore.realm.value.name,
				})
			"
			@add="onPostAdded"
		/>

		<AppActivityFeedLazy v-if="feed?.isBootstrapped" :feed="feed" show-ads />
	</div>
</template>
