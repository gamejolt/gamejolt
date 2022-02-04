<script lang="ts">
import { computed, Ref, ref } from 'vue';
import { Api } from '../../../../_common/api/api.service';
import { Realm } from '../../../../_common/realm/realm-model';
import { createAppRoute, defineAppRouteOptions } from '../../../../_common/route/route-component';
import { $gettextInterpolate } from '../../../../_common/translate/translate.service';
import AppRealmFullCard from '../../../../_common/realm/AppRealmFullCard.vue';
import AppShareCard from '../../../../_common/share/card/AppShareCard.vue';
import { getAbsoluteLink } from '../../../../utils/router';
import { useRouter, RouterLink, useRoute } from 'vue-router';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import { vAppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import AppCommunityThumbnailImg from '../../../../_common/community/thumbnail/AppCommunityThumbnailImg.vue';
import AppCommunityVerifiedTick from '../../../../_common/community/verified-tick/verified-tick.vue';
import { ActivityFeedService } from '../../../components/activity/feed/feed-service';
import { ActivityFeedView } from '../../../components/activity/feed/view';
import AppActivityFeed from '../../../components/activity/feed/feed.vue';
import AppScrollAffix from '../../../../_common/scroll/AppScrollAffix.vue';
import { User } from '../../../../_common/user/user.model';
import AppUserKnownFollowers from '../../../components/user/known-followers/AppUserKnownFollowers.vue';
import { Screen } from '../../../../_common/screen/screen-service';
import AppRealmFollowButton from '../../../../_common/realm/AppRealmFollowButton.vue';
import AppButton from '../../../../_common/button/AppButton.vue';
import { ShareModal } from '../../../../_common/share/card/_modal/modal.service';

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

function onShareClick() {
	if (!shareLink.value) {
		return;
	}
	ShareModal.show({ resource: 'realm', url: shareLink.value });
}
</script>

<template>
	<div class="fill-backdrop">
		<section v-if="realm" class="section">
			<div class="container-xl">
				<div class="row">
					<div class="col-lg-3">
						<AppScrollAffix :disabled="!Screen.isLg">
							<AppRealmFullCard v-if="Screen.isLg" :realm="realm" />
							<template v-else>
								<h1 class="-heading">
									<span class="-heading-text">{{ realm.name }}</span>
									<AppButton
										class="-more"
										icon="arrow-forward"
										sparse
										circle
										trans
										@click="onShareClick"
									/>
								</h1>

								<AppRealmFollowButton class="-follow" :realm="realm" block />
							</template>

							<div class="-followers">
								<AppUserKnownFollowers
									:users="knownFollowers"
									:count="knownFollowerCount"
								/>
							</div>
						</AppScrollAffix>
					</div>

					<div class="col-lg-3 col-lg-push-6">
						<AppScrollAffix :disabled="!Screen.isLg">
							<h5 class="-communities-header sans-margin-top">
								<AppTranslate>Top Contributing Communities</AppTranslate>
							</h5>

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

							<AppShareCard
								v-if="shareLink && Screen.isLg"
								resource="realm"
								:url="shareLink"
							/>
						</AppScrollAffix>
					</div>

					<div class="col-lg-6 col-lg-pull-3">
						<AppActivityFeed v-if="feed?.isBootstrapped" :feed="feed" />
					</div>
				</div>
			</div>
		</section>
	</div>
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
