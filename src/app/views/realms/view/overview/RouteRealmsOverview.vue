<script lang="ts">
import { computed, Ref, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Api } from '../../../../../_common/api/api.service';
import AppButton from '../../../../../_common/button/AppButton.vue';
import { FiresidePost } from '../../../../../_common/fireside/post/post-model';
import AppLoadingFade from '../../../../../_common/loading/AppLoadingFade.vue';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '../../../../../_common/route/route-component';
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
const { realm, firesides, processPayload } = useRealmRouteStore();
const router = useRouter();
const route = useRoute();

const feed = ref(null) as Ref<ActivityFeedView | null>;
const isBootstrapped = ref(false);

// How many firesides to show in the preview row, including the "add a fireside".
const firesidesGridColumns = 5;

const displayablePreviewFiresides = computed(() => {
	// -1 to leave room for the "add a fireside"
	return firesides.value.slice(0, firesidesGridColumns - 1);
});

const appRoute = createAppRoute({
	routeTitle: computed(() =>
		realm.value
			? $gettextInterpolate(`%{ realm } Realm - Art, videos, guides, polls and more`, {
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
				{{ $gettext(`Firesides`) }}
			</h4>

			<AppButton
				trans
				:to="{
					name: routeRealmsViewFiresides.name,
					params: { path: route.params['path'] },
				}"
			>
				{{ $gettext(`View all`) }}
			</AppButton>
		</div>

		<AppLoadingFade :is-loading="!isBootstrapped">
			<div
				:style="{
					gridTemplateColumns: `repeat(${firesidesGridColumns}, 1fr)`,
					display: `grid`,
					gridGap: kLineHeightComputed.px,
					marginBottom: kLineHeightComputed.px,
				}"
			>
				<AppFiresideAvatarAdd v-if="realm" :realms="[realm]" />

				<AppFiresideAvatar
					v-for="fireside in displayablePreviewFiresides"
					:key="fireside.id"
					:fireside="fireside"
					hide-realm
				/>
			</div>
		</AppLoadingFade>

		<AppPostAddButton
			v-if="realm"
			:realm="realm"
			:placeholder="
				$gettextInterpolate(`Post about %{ realm }!`, {
					realm: realm.name,
				})
			"
			@add="onPostAdded"
		/>

		<AppActivityFeedLazy v-if="feed?.isBootstrapped" :feed="feed" show-ads />
	</div>
</template>
