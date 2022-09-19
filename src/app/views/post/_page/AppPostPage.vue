<script lang="ts" setup>
import { computed, PropType, ref, shallowRef, toRefs, watch } from 'vue';
import { RouteLocationRaw, RouterLink, useRoute, useRouter } from 'vue-router';
import { arrayRemove } from '../../../../utils/array';
import AppAdWidget from '../../../../_common/ad/widget/AppAdWidget.vue';
import AppBackground from '../../../../_common/background/AppBackground.vue';
import AppCommentDisabledCheck from '../../../../_common/comment/AppCommentDisabledCheck.vue';
import { CommunityUserNotification } from '../../../../_common/community/user-notification/user-notification.model';
import AppContentViewer from '../../../../_common/content/content-viewer/content-viewer.vue';
import { FiresidePost } from '../../../../_common/fireside/post/post-model';
import {
	$viewPostVideo,
	FiresidePostVideo,
} from '../../../../_common/fireside/post/video/video-model';
import { showInfoGrowl, showSuccessGrowl } from '../../../../_common/growls/growls.service';
import AppJolticon from '../../../../_common/jolticon/AppJolticon.vue';
import { createLightbox } from '../../../../_common/lightbox/lightbox-helpers';
import { MediaItem } from '../../../../_common/media-item/media-item-model';
import AppMediaItemPost from '../../../../_common/media-item/post/post.vue';
import AppResponsiveDimensions from '../../../../_common/responsive-dimensions/AppResponsiveDimensions.vue';
import { Screen } from '../../../../_common/screen/screen-service';
import { Scroll } from '../../../../_common/scroll/scroll.service';
import AppShareCard from '../../../../_common/share/card/AppShareCard.vue';
import AppSpacer from '../../../../_common/spacer/AppSpacer.vue';
import AppStickerControlsOverlay from '../../../../_common/sticker/AppStickerControlsOverlay.vue';
import AppStickerPlacementList from '../../../../_common/sticker/AppStickerPlacementList.vue';
import AppStickerLayer from '../../../../_common/sticker/layer/AppStickerLayer.vue';
import AppStickerTarget from '../../../../_common/sticker/target/AppStickerTarget.vue';
import {
	createStickerTargetController,
	provideStickerTargetController,
	StickerTargetController,
} from '../../../../_common/sticker/target/target-controller';
import { useCommonStore } from '../../../../_common/store/common-store';
import { AppTimeAgo } from '../../../../_common/time/ago/ago';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import { $gettext } from '../../../../_common/translate/translate.service';
import AppUserCardHover from '../../../../_common/user/card/AppUserCardHover.vue';
import AppUserFollowWidget from '../../../../_common/user/follow/widget.vue';
import AppUserAvatar from '../../../../_common/user/user-avatar/AppUserAvatar.vue';
import AppUserVerifiedTick from '../../../../_common/user/verified-tick/AppUserVerifiedTick.vue';
import AppVideoPlayer from '../../../../_common/video/player/player.vue';
import AppVideoProcessingProgress from '../../../../_common/video/processing-progress/processing-progress.vue';
import AppCommunityUserNotification from '../../../components/community/user-notification/user-notification.vue';
import AppFiresidePostEmbed from '../../../components/fireside/post/embed/embed.vue';
import AppGameBadge from '../../../components/game/badge/badge.vue';
import { AppCommentWidgetLazy } from '../../../components/lazy';
import AppPageContainer from '../../../components/page-container/AppPageContainer.vue';
import AppPollVoting from '../../../components/poll/voting/voting.vue';
import AppActivityFeedPostContent from '../../../components/post/AppPostContent.vue';
import AppPostHeader from '../../../components/post/AppPostHeader.vue';
import AppPostTargets from '../../../components/post/AppPostTargets.vue';
import AppPostControls from '../../../components/post/controls/AppPostControls.vue';
import AppPostPageRecommendations from './recommendations/AppPostPageRecommendations.vue';

const UserFollowLocation = 'postPage';

const props = defineProps({
	post: {
		type: Object as PropType<FiresidePost>,
		required: true,
	},
	communityNotifications: {
		type: Array as PropType<CommunityUserNotification[]>,
		default: () => [],
	},
});

const { post, communityNotifications } = toRefs(props);

const route = useRoute();
const router = useRouter();
const { user } = useCommonStore();

const stickerTargetController = shallowRef<StickerTargetController>(
	createStickerTargetController(post.value, {
		isCreator: computed(() => post.value.displayUser.is_creator === true),
	})
);

provideStickerTargetController(stickerTargetController);

const videoStartTime = ref(0);
const hasVideoProcessingError = ref(false);
const videoProcessingErrorMsg = ref('');

const lightbox = createLightbox(computed(() => post.value.media));

const stickerScroll = ref<HTMLDivElement>();

const displayUser = computed(() => {
	return post.value.displayUser;
});

const communities = computed(() => {
	return post.value.communities || [];
});

const realms = computed(() => {
	return post.value.realms.map(i => i.realm);
});

const shouldShowCommunityPublishError = computed(() => {
	return post.value.status === FiresidePost.STATUS_DRAFT && !post.value.canPublishToCommunities();
});

const video = computed<FiresidePostVideo | null>(() => {
	return post.value.videos[0] || null;
});

const background = computed(() => {
	return post.value.background;
});

if (typeof route.query.t === 'string') {
	if (video.value) {
		// DODO: Set the max val to the video end time.
		videoStartTime.value = Math.floor(Math.max(0, parseInt(route.query.t, 10))) * 1000;
	}

	// Get rid of the time from the URL so that it doesn't pollute
	// shared addresses.
	router.replace({
		...route,
		query: { ...route.query, t: undefined },
	} as RouteLocationRaw);
}

watch(
	() => post.value.id,
	() => {
		stickerTargetController.value = createStickerTargetController(post.value, {
			isCreator: computed(() => post.value.displayUser.is_creator === true),
		});
	}
);

function onVideoProcessingComplete(payload: any) {
	if (payload.video && video.value) {
		video.value.assign(payload.video);
	}
}

function onVideoProcessingError(err: string | Error) {
	if (typeof err === 'string') {
		hasVideoProcessingError.value = true;
		videoProcessingErrorMsg.value = err;
	} else {
		// The only cases where an actual error is emitted is on network error during polling.
		// This does not necessarily mean an actual error during processing, so noop.
	}
}

function onPostRemoved() {
	router.replace({ name: 'home' });
	showInfoGrowl($gettext('Your post has been removed'));
}

function onPostPublished() {
	showSuccessGrowl({
		title: $gettext('Huzzah!'),
		message: $gettext('Your post has been published.'),
	});
}

function onClickFullscreen(mediaItem: MediaItem) {
	const index = post.value.media.findIndex(i => i.id === mediaItem.id);
	lightbox.show(index !== -1 ? index : null);
}

function onVideoPlay() {
	if (video.value) {
		$viewPostVideo(video.value);
	}
}

function scrollToStickers() {
	if (stickerScroll.value) {
		Scroll.to(stickerScroll.value, { preventDirections: ['down'] });
	}
}

function onDismissNotification(notification: CommunityUserNotification) {
	arrayRemove(communityNotifications.value, i => i.id === notification.id);
}
</script>

<template>
	<!--
	A lot of components on this page don't properly respond to inputs changing,
	so key on the post ID so that everything gets recompiled when switching
	posts.
	-->
	<AppStickerLayer no-mask>
		<section
			:key="post.id"
			class="-section section-thin"
			:class="{ '-sans-padding-top': !!background }"
		>
			<div v-if="video" class="container-xl">
				<div class="full-bleed-xs">
					<template v-if="video.provider === 'gamejolt'">
						<template v-if="!hasVideoProcessingError">
							<AppVideoPlayer
								v-if="!video.is_processing && video.posterMediaItem"
								context="page"
								:media-item="video.posterMediaItem"
								:manifests="video.manifestSources"
								:view-count="video.view_count"
								:start-time="videoStartTime"
								autoplay
								show-video-stats
								@play="onVideoPlay"
							/>
							<template v-else>
								<AppVideoProcessingProgress
									:post="post"
									@complete="onVideoProcessingComplete"
									@error="onVideoProcessingError"
								/>
							</template>
						</template>
						<template v-else>
							<AppResponsiveDimensions :ratio="16 / 9">
								<div class="-video-preview">
									<AppJolticon icon="video" big class="-video-preview-icon" />
								</div>
							</AppResponsiveDimensions>
							<br />
							<div class="alert alert-notice">{{ videoProcessingErrorMsg }}</div>
						</template>
					</template>
				</div>
			</div>
			<AppBackground
				v-else-if="background"
				class="-background-wrapper"
				:background="background"
				darken
			>
				<AppPageContainer xl>
					<AppSpacer :scale="4" vertical />

					<AppPostHeader :post="post" :follow-location="UserFollowLocation" show-date />
					<AppActivityFeedPostContent
						:post="post"
						:sticker-target-controller="stickerTargetController"
					/>
					<AppSpacer :scale="2" vertical />
				</AppPageContainer>
			</AppBackground>

			<AppPageContainer xl>
				<template #default>
					<template v-if="communityNotifications">
						<AppCommunityUserNotification
							v-for="communityNotification of communityNotifications"
							:key="communityNotification.id"
							:notification="communityNotification"
							@dismiss="onDismissNotification(communityNotification)"
						/>
					</template>

					<div class="post-view">
						<template v-if="background">
							<AppSpacer :scale="4" vertical />
						</template>
						<template v-else>
							<AppGameBadge
								v-if="post.game"
								class="-game-badge"
								:game="post.game"
								full-bleed
							/>

							<div>
								<!-- User Info -->
								<div class="-user-info">
									<div class="-avatar">
										<AppUserCardHover
											:user="displayUser"
											:disabled="Screen.isXs"
										>
											<AppUserAvatar
												class="-circle-img"
												:user="displayUser"
											/>
										</AppUserCardHover>
									</div>

									<RouterLink :to="displayUser.url" class="-name link-unstyled">
										<span>
											<strong>{{ displayUser.display_name }}</strong>
											<AppUserVerifiedTick :user="displayUser" />
										</span>
										<span class="tiny text-muted">
											@{{ displayUser.username }}
										</span>
									</RouterLink>

									<div class="-controls">
										<AppUserFollowWidget
											v-if="!user || displayUser.id !== user.id"
											:user="displayUser"
											hide-count
											:location="UserFollowLocation"
										/>
									</div>
								</div>
							</div>
							<!--
						Indicates where sticker placements may begin for scrolling when they show
						stickers.
						-->
							<div ref="sticker-scroll" />

							<div v-if="post.hasMedia" class="-media-items">
								<div v-for="item of post.media" :key="item.id">
									<AppMediaItemPost
										class="-media-item"
										:media-item="item"
										is-active
										can-place-sticker
										@fullscreen="onClickFullscreen"
									/>
									<br />
								</div>
							</div>

							<div class="tiny text-muted">
								<AppTimeAgo v-if="post.isActive" :date="post.published_on" strict />
								<template v-else-if="post.isScheduled">
									<span class="tag" style="vertical-align: middle">
										<AppJolticon icon="calendar-grid" />
										{{ ' ' }}
										<AppTranslate>Scheduled</AppTranslate>
									</span>
									{{ ' ' }}
									<AppTimeAgo :date="post.scheduled_for" strict without-suffix />
								</template>
								<span
									v-else-if="post.isDraft"
									class="tag"
									style="vertical-align: middle"
								>
									<AppTranslate>Draft</AppTranslate>
								</span>
							</div>

							<AppStickerTarget :controller="stickerTargetController">
								<AppContentViewer :source="post.lead_content" />
							</AppStickerTarget>
						</template>

						<AppFiresidePostEmbed
							v-for="embed of post.embeds"
							:key="embed.id"
							:embed="embed"
							:hide-outview="false"
						/>

						<div v-if="post.has_article">
							<div v-if="!background || post.embeds.length > 0" class="page-cut" />

							<template v-if="!post.hasArticleContent">
								<span class="lazy-placeholder" />
								<span class="lazy-placeholder" />
								<p>
									<span class="lazy-placeholder" style="width: 70%" />
								</p>
							</template>
							<AppContentViewer v-else :source="post.article_content" />
						</div>
					</div>

					<AppStickerControlsOverlay v-if="post.hasPoll">
						<AppPollVoting :poll="post.poll" :game="post.game" :user="post.user" />

						<br />
					</AppStickerControlsOverlay>

					<AppStickerControlsOverlay
						v-if="
							communities.length ||
							post.supporters.length ||
							post.sticker_counts.length
						"
					>
						<AppStickerPlacementList
							:sticker-target-controller="stickerTargetController"
							:supporters="post.supporters"
							:stickers="post.sticker_counts"
							@show="scrollToStickers()"
						/>

						<AppPostTargets :communities="communities" :realms="realms" has-links />

						<template v-if="shouldShowCommunityPublishError">
							<br />
							<div class="well fill-offset">
								<AppJolticon icon="notice" notice />
								<span>
									<AppTranslate>
										You can't publish this post to the selected community
										channel because you don't have permissions to post into that
										specific channel. Please select a different channel.
									</AppTranslate>
								</span>
							</div>
						</template>

						<div class="-controls-spacing" />
					</AppStickerControlsOverlay>

					<AppPostControls
						:post="post"
						should-show-follow
						location="postPage"
						event-label="page"
						@post-remove="onPostRemoved"
						@post-publish="onPostPublished"
						@sticker="scrollToStickers()"
					/>

					<div v-if="Screen.isMobile">
						<AppPostPageRecommendations :key="post.id" :post="post" />
					</div>

					<br />
					<br />
					<AppCommentDisabledCheck :model="post">
						<AppCommentWidgetLazy :model="post" display-mode="comments" />
					</AppCommentDisabledCheck>
				</template>

				<template v-if="!Screen.isMobile" #right>
					<div class="-side-col">
						<div class="-share">
							<AppShareCard resource="post" :url="post.url" offset-color />
						</div>

						<AppAdWidget size="rectangle" placement="side" />

						<AppPostPageRecommendations :key="post.id" :post="post" />
					</div>
				</template>
			</AppPageContainer>
		</section>
	</AppStickerLayer>
</template>

<style lang="stylus" scoped>
@import '../variables'
@import '../common'

.-controls-spacing
	padding-bottom: $-controls-spacing-xs

	@media $media-sm-up
		padding-bottom: $-controls-spacing

.-game-badge
	margin-top: $-spacing
	margin-bottom: 0

	@media $media-sm-up
		margin-bottom: $-spacing

.-name
	margin-right: auto
	min-width: 0

	> *
		text-overflow()
		display: block

	&:hover
		text-decoration: none

		strong
			text-decoration: underline

.-controls
	flex: none
	margin-left: 12px

.-circle-img
	::v-deep(img)
		border-radius: 50% !important

.-backdrop
	change-bg('bg-offset')

.-media-items
	full-bleed-xs()

	@media $media-lg-up
		margin-left: -50px
		margin-right: -50px

.-media-item
	position: relative
	margin-left: auto
	margin-right: auto

.-img
.-video
	width: 100%
	height: 100%

.-media-item
	cursor: zoom-in

::v-deep(.mention-avatar-img)
	border-radius: 50% !important

.-communities
	white-space: nowrap

.-side-col
	@media $media-lg-up
		margin-left: 50px

.-share
	margin-top: $line-height-computed * 1.5

.-sans-padding-top
	padding-top: 0

.-video-preview
	change-bg('bg-offset')
	rounded-corners-lg()
	overflow: hidden
	position: relative
	height: 100%
	display: flex
	justify-content: center
	align-items: center

.-video-preview-icon
	filter: drop-shadow(0 0 5px rgba(0, 0, 0, 1))
</style>
