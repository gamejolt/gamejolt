<script lang="ts">
import { computed, Ref, ref } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { getAbsoluteLink } from '../../../../utils/router';
import { Api } from '../../../../_common/api/api.service';
import AppAspectRatio from '../../../../_common/aspect-ratio/AppAspectRatio.vue';
import AppButton from '../../../../_common/button/AppButton.vue';
import AppCommunityThumbnailImg from '../../../../_common/community/thumbnail/AppCommunityThumbnailImg.vue';
import AppCommunityVerifiedTick from '../../../../_common/community/verified-tick/verified-tick.vue';
import { Meta } from '../../../../_common/meta/meta-service';
import AppRealmFollowButton from '../../../../_common/realm/AppRealmFollowButton.vue';
import AppRealmFullCard from '../../../../_common/realm/AppRealmFullCard.vue';
import { RealmCommunity } from '../../../../_common/realm/realm-community-model';
import { Realm } from '../../../../_common/realm/realm-model';
import { createAppRoute, defineAppRouteOptions } from '../../../../_common/route/route-component';
import { Screen } from '../../../../_common/screen/screen-service';
import AppScrollAffix from '../../../../_common/scroll/AppScrollAffix.vue';
import AppShareCard from '../../../../_common/share/card/AppShareCard.vue';
import { ShareModal } from '../../../../_common/share/card/_modal/modal.service';
import AppSpacer from '../../../../_common/spacer/AppSpacer.vue';
import { vAppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import { $gettextInterpolate } from '../../../../_common/translate/translate.service';
import { User } from '../../../../_common/user/user.model';
import { ActivityFeedService } from '../../../components/activity/feed/feed-service';
import { ActivityFeedView } from '../../../components/activity/feed/view';
import { AppActivityFeedLazy } from '../../../components/lazy';
import AppPageContainer from '../../../components/page-container/AppPageContainer.vue';
import AppShellPageBackdrop from '../../../components/shell/AppShellPageBackdrop.vue';
import AppUserKnownFollowers from '../../../components/user/known-followers/AppUserKnownFollowers.vue';

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
const router = useRouter();
const route = useRoute();

const realm = ref<Realm>();
const knownFollowers = ref<User[]>([]);
const knownFollowerCount = ref(0);
const realmCommunities = ref<RealmCommunity[]>([]);
const feed = ref(null) as Ref<ActivityFeedView | null>;
const isBootstrapped = ref(false);

const shareLink = computed(() =>
	realm.value ? getAbsoluteLink(router, realm.value.routeLocation) : undefined
);

const shownCommunities = computed(() => realmCommunities.value.map(i => i.community) ?? []);

createAppRoute({
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
	onResolved({ payload: [payload, feedPayload], fromCache }) {
		isBootstrapped.value = true;

		realm.value = new Realm(payload.realm);
		realmCommunities.value = RealmCommunity.populate(payload.communities);
		knownFollowers.value = User.populate(payload.knownFollowers);
		knownFollowerCount.value = payload.knownFollowerCount || 0;

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

		Meta.description = payload.metaDescription;
		Meta.fb = payload.fb;
		Meta.twitter = payload.twitter;
	},
});

function onShareClick() {
	if (!shareLink.value) {
		return;
	}
	ShareModal.show({ resource: 'realm', url: shareLink.value });
}
</script>

<template>
	<AppShellPageBackdrop v-if="realm">
		<AppSpacer vertical :scale="10" :scale-sm="5" :scale-xs="5" />

		<AppPageContainer xl>
			<template #left>
				<AppScrollAffix :disabled="!Screen.isLg">
					<AppRealmFullCard v-if="Screen.isDesktop" :realm="realm" />
					<template v-else>
						<h1 class="-heading">
							<span class="-heading-text">{{ realm.name }}</span>
							<AppButton
								class="-more"
								icon="share-airplane"
								trans
								@click="onShareClick"
							>
								<AppTranslate>Share</AppTranslate>
							</AppButton>
						</h1>

						<AppRealmFollowButton
							class="-follow"
							:realm="realm"
							source="realmHeader"
							block
						/>
					</template>

					<div class="-followers">
						<AppUserKnownFollowers
							:users="knownFollowers"
							:count="knownFollowerCount"
						/>
					</div>
				</AppScrollAffix>
			</template>
			<template #right>
				<AppScrollAffix :disabled="!Screen.isLg">
					<h5 class="-communities-header sans-margin-top">
						<AppTranslate>Top Contributing Communities</AppTranslate>
					</h5>

					<div class="-communities">
						<template v-if="!isBootstrapped">
							<div
								v-for="i in 3"
								:key="i"
								class="-community-item -community-thumb-placeholder"
							>
								<AppAspectRatio :ratio="1" />
							</div>
						</template>
						<template v-else>
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
						</template>
					</div>

					<AppShareCard
						v-if="shareLink && Screen.isDesktop"
						resource="realm"
						:url="shareLink"
					/>
				</AppScrollAffix>
			</template>
			<template #default>
				<AppActivityFeedLazy v-if="feed?.isBootstrapped" :feed="feed" show-ads />
			</template>
		</AppPageContainer>

		<AppSpacer vertical :scale="10" :scale-sm="5" :scale-xs="5" />
	</AppShellPageBackdrop>
</template>

<style lang="stylus" scoped>
.-heading
	display: flex
	flex-direction: row
	align-items: center
	font-size: 18px
	height: 48px
	margin: 0
	margin-bottom: 8px

.-heading-text
	flex: auto

.-more
	flex: none

.-follow
	margin-bottom: 8px

.-followers
	display: flex
	align-items: center
	justify-content: center

	@media $media-lg-up
		display: block

.-communities-header
	margin-top: 32px
	font-size: $font-size-small

	@media $media-lg-up
		margin-top: 0
		font-size: $font-size-base

.-communities
	display: grid
	grid-template-columns: repeat(10, minmax(24px, 1fr))
	grid-gap: 8px
	margin-bottom: 54px

	@media $media-lg-up
		grid-template-columns: repeat(5, minmax(55px, 1fr))

.-community-item
	pressy()
	display: inline-block
	position: relative
	width: 100%
	height: auto

.-community-thumb-placeholder
	img-circle()
	change-bg('bg-subtle')

.-community-verified-tick
	position: absolute
	right: -3px
	bottom: -1px
	change-bg('bg-offset')
	border-radius: 50%
</style>
