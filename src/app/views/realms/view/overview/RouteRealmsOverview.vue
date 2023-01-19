<script lang="ts">
import { computed, Ref, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Api } from '../../../../../_common/api/api.service';
import AppButton from '../../../../../_common/button/AppButton.vue';
import { Fireside } from '../../../../../_common/fireside/fireside.model';
import { FiresidePost } from '../../../../../_common/fireside/post/post-model';
import AppLoadingFade from '../../../../../_common/loading/AppLoadingFade.vue';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '../../../../../_common/route/route-component';
import AppTranslate from '../../../../../_common/translate/AppTranslate.vue';
import { $gettextInterpolate } from '../../../../../_common/translate/translate.service';
import { kLineHeightComputed } from '../../../../../_styles/variables';
import { ActivityFeedService } from '../../../../components/activity/feed/feed-service';
import { ActivityFeedView } from '../../../../components/activity/feed/view';
import AppFiresideAvatar from '../../../../components/fireside/avatar/AppFiresideAvatar.vue';
import AppFiresideAvatarAdd from '../../../../components/fireside/avatar/AppFiresideAvatarAdd.vue';
import { AppActivityFeedLazy } from '../../../../components/lazy';
import AppPostAddButton from '../../../../components/post/add-button/AppPostAddButton.vue';
import { routeRealmsViewFiresides } from '../firesides/firesides.route';
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
const firesides = ref<Fireside[]>([]);
const isBootstrapped = ref(false);

// How many firesides to show in the preview row, including the "add a fireside".
const firesidesGridColumns = 5;

const displayablePreviewFiresides = computed(() => {
	// -1 to leave room for the "add a fireside"
	const perRow = firesidesGridColumns - 1;
	return Object.freeze(firesides.value.slice(0, perRow));
});

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

		// TODO(fireside-realms) this does not exist on this payload. need a new overview endpoint.
		firesides.value = []; // Fireside.populate(payload.activeFiresides);
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
		<div
			:style="{
				display: `flex`,
				justifyContent: `space-between`,
			}"
		>
			<h4 class="section-header">
				<AppTranslate>Firesides</AppTranslate>
			</h4>

			<AppButton
				trans
				:to="{
					name: routeRealmsViewFiresides.name,
					params: { path: routeStore.realm.value.path },
				}"
			>
				<AppTranslate>View All</AppTranslate>
			</AppButton>
		</div>

		<AppLoadingFade :is-loading="!isBootstrapped">
			<div
				:style="{
					gridTemplateColumns: `repeat(${firesidesGridColumns}, 1fr)`,
					display: `grid`,
					gridGap: `${kLineHeightComputed}px`,
					marginBottom: `${kLineHeightComputed}px`,
				}"
			>
				<AppFiresideAvatarAdd :realms="[routeStore.realm.value]" />

				<AppFiresideAvatar
					v-for="fireside in displayablePreviewFiresides"
					:key="fireside.id"
					:fireside="fireside"
					hide-realm
				/>
			</div>
		</AppLoadingFade>

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
