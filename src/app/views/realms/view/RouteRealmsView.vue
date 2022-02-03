<script lang="ts">
import { computed, Ref, ref } from 'vue';
import { Api } from '../../../../_common/api/api.service';
import { Realm } from '../../../../_common/realm/realm-model';
import { createAppRoute, defineAppRouteOptions } from '../../../../_common/route/route-component';
import { $gettextInterpolate } from '../../../../_common/translate/translate.service';
import AppPageContainer from '../../../components/page-container/AppPageContainer.vue';
import AppRealmFullCard from '../../../../_common/realm/AppRealmFullCard.vue';
import AppShareCard from '../../../../_common/share/card/AppShareCard.vue';
import { getAbsoluteLink } from '../../../../utils/router';
import { useRouter, RouterLink, useRoute } from 'vue-router';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import { vAppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import AppCommunityThumbnailImg from '../../../../_common/community/thumbnail/img/img.vue';
import AppCommunityVerifiedTick from '../../../../_common/community/verified-tick/verified-tick.vue';
import { ActivityFeedService } from '../../../components/activity/feed/feed-service';
import { ActivityFeedView } from '../../../components/activity/feed/view';
import AppActivityFeed from '../../../components/activity/feed/feed.vue';
import AppScrollAffix from '../../../../_common/scroll/AppScrollAffix.vue';
import { User } from '../../../../_common/user/user.model';

export default {
	...defineAppRouteOptions({
		resolver: async ({ route }) =>
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
import AppUserKnownFollowers from '../../../components/user/known-followers/AppUserKnownFollowers.vue';
const router = useRouter();
const route = useRoute();

const realm = ref<Realm>();
const knownFollowers = ref<User[]>([]);
const knownFollowerCount = ref(0);
const feed = ref(null) as Ref<ActivityFeedView | null>;

const shareLink = computed(() =>
	realm.value ? getAbsoluteLink(router, realm.value.routeLocation) : undefined
);

const shownCommunities = computed(() => realm.value?.communities.map(i => i.community) ?? []);

createAppRoute({
	routeTitle: computed(() =>
		realm.value ? $gettextInterpolate(`%{ realm } Realm`, { realm: realm.value.name }) : ''
	),
	onInit() {
		feed.value = ActivityFeedService.routeInitComposition(false);
	},
	onResolved({ payload: [payload, feedPayload], fromCache }) {
		realm.value = new Realm(payload.realm);
		knownFollowers.value = User.populate(payload.knownFollowers);
		knownFollowerCount.value = payload.knownFollowerCount || 0;

		feed.value = ActivityFeedService.routed(
			feed.value,
			{
				type: 'EventItem',
				name: 'realm',
				url: `/web/posts/fetch/realm/${route.params.path}`,
				shouldShowFollow: true,
				// itemsPerPage: payload.perPage,
				itemsPerPage: 15,
			},
			feedPayload.items,
			fromCache
		);
	},
});
</script>

<template>
	<div class="fill-backdrop">
		<section class="section">
			<AppPageContainer v-if="realm" xl>
				<template #default>
					<AppActivityFeed v-if="feed?.isBootstrapped" :feed="feed" />
				</template>

				<template #left>
					<AppScrollAffix>
						<AppRealmFullCard :realm="realm" />

						<AppUserKnownFollowers
							:users="knownFollowers"
							:count="knownFollowerCount"
						/>
					</AppScrollAffix>
				</template>

				<template #right>
					<AppScrollAffix>
						<h4 class="sans-margin-top">
							<AppTranslate>Top Contributing Communities</AppTranslate>
						</h4>

						<div class="-communities">
							<!-- <template v-if="!isOverviewLoaded || isLoadingAllCommunities">
								<div
									v-for="i in previewCommunityCount"
									:key="i"
									class="-community-item -community-thumb-placeholder"
								/>
							</template>
							<template v-else> -->
							<RouterLink
								v-for="community of shownCommunities"
								:key="community.id"
								v-app-tooltip.bottom="community.name"
								class="-community-item link-unstyled"
								:to="community.routeLocation"
							>
								<AppCommunityThumbnailImg
									class="-community-thumb"
									:community="community"
								/>
								<AppCommunityVerifiedTick
									class="-community-verified-tick"
									:community="community"
									no-tooltip
								/>
							</RouterLink>
							<!-- </template> -->
						</div>

						<AppShareCard v-if="shareLink" resource="realm" :url="shareLink" />
					</AppScrollAffix>
				</template>
			</AppPageContainer>
		</section>
	</div>
</template>

<style lang="stylus" scoped>
.-communities
	display: grid
	grid-template-columns: repeat(5, minmax(55px, 1fr))
	grid-gap: 8px
	margin-bottom: 54px

.-community-item
	pressy()
	display: inline-block
	position: relative
	outline: 0
	width: 100%
	height: auto

.-community-thumb
	img-circle()
	change-bg('dark')
	width: 100%
	height: 100%

	::v-deep(img)
		width: calc(100% - 2px)
		height: calc(100% - 2px)

.-community-thumb-placeholder
	img-circle()
	change-bg('bg-subtle')
	// Setting 'padding-top' with a percentage goes off the elements width,
	// rather than the height. This will allow us to use a 1:1 aspect ratio
	// for the loading placeholders, matching them up with our thumbnails.
	padding-top: 100%

.-community-verified-tick
	position: absolute
	right: -3px
	bottom: -1px
	change-bg('bg-offset')
	border-radius: 50%
</style>
