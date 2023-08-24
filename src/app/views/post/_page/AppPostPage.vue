<script lang="ts" setup>
import { computed, PropType, ref, shallowRef, toRefs, watch } from 'vue';
import { RouteLocationRaw, useRoute, useRouter } from 'vue-router';
import AppAdWidget from '../../../../_common/ad/widget/AppAdWidget.vue';
import AppBackground from '../../../../_common/background/AppBackground.vue';
import AppCommentDisabledCheck from '../../../../_common/comment/AppCommentDisabledCheck.vue';
import { CommunityUserNotificationModel } from '../../../../_common/community/user-notification/user-notification.model';
import AppContentViewer from '../../../../_common/content/content-viewer/AppContentViewer.vue';
import { isDynamicGoogleBot } from '../../../../_common/device/device.service';
import {
	FiresidePostModel,
	FiresidePostStatus,
} from '../../../../_common/fireside/post/post-model';
import {
	$viewPostVideo,
	FiresidePostVideoModel,
} from '../../../../_common/fireside/post/video/video-model';
import { showInfoGrowl, showSuccessGrowl } from '../../../../_common/growls/growls.service';
import AppJolticon from '../../../../_common/jolticon/AppJolticon.vue';
import AppResponsiveDimensions from '../../../../_common/responsive-dimensions/AppResponsiveDimensions.vue';
import { Screen } from '../../../../_common/screen/screen-service';
import { Scroll } from '../../../../_common/scroll/scroll.service';
import AppShareCard from '../../../../_common/share/card/AppShareCard.vue';
import AppSpacer from '../../../../_common/spacer/AppSpacer.vue';
import AppStickerControlsOverlay from '../../../../_common/sticker/AppStickerControlsOverlay.vue';
import AppStickerPlacementList from '../../../../_common/sticker/AppStickerPlacementList.vue';
import AppStickerLayer from '../../../../_common/sticker/layer/AppStickerLayer.vue';
import {
	createStickerTargetController,
	provideStickerTargetController,
	StickerTargetController,
} from '../../../../_common/sticker/target/target-controller';
import { $gettext } from '../../../../_common/translate/translate.service';
import AppVideoPlayer from '../../../../_common/video/player/AppVideoPlayer.vue';
import AppVideoProcessingProgress from '../../../../_common/video/processing-progress/AppVideoProcessingProgress.vue';
import AppContentTargets from '../../../components/content/AppContentTargets.vue';
import AppFiresidePostEmbed from '../../../components/fireside/post/embed/embed.vue';
import { AppCommentWidgetLazy } from '../../../components/lazy';
import AppPageContainer from '../../../components/page-container/AppPageContainer.vue';
import AppPollVoting from '../../../components/poll/AppPollVoting.vue';
import AppPostControls from '../../../components/post/controls/AppPostControls.vue';
import AppPostPageContent from './AppPostPageContent.vue';
import AppPostPageRecommendations from './recommendations/AppPostPageRecommendations.vue';

const props = defineProps({
	post: {
		type: Object as PropType<FiresidePostModel>,
		required: true,
	},
	communityNotifications: {
		type: Array as PropType<CommunityUserNotificationModel[]>,
		default: () => [],
	},
});

const { post, communityNotifications } = toRefs(props);

const route = useRoute();
const router = useRouter();

const stickerTargetController = shallowRef<StickerTargetController>(
	createStickerTargetController(post.value, {
		isCreator: computed(() => post.value.displayUser.is_creator === true),
	})
);

provideStickerTargetController(stickerTargetController);

const stickerScroll = ref<HTMLDivElement>();

const videoStartTime = ref(0);
const hasVideoProcessingError = ref(false);
const videoProcessingErrorMsg = ref('');

const communities = computed(() => post.value.communities || []);
const realms = computed(() => post.value.realms.map(i => i.realm));
const shouldShowCommunityPublishError = computed(
	() => post.value.status === FiresidePostStatus.Draft && !post.value.canPublishToCommunities()
);
const video = computed<FiresidePostVideoModel | null>(() => post.value.videos[0] || null);
const background = computed(() => post.value.background);

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

function scrollToStickers() {
	if (stickerScroll.value) {
		Scroll.to(stickerScroll.value, { preventDirections: ['down'] });
	}
}

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

function onVideoPlay() {
	if (video.value) {
		$viewPostVideo(video.value);
	}
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
			:class="{ '_sans-padding-top': !!background }"
		>
			<AppBackground :background="background" darken>
				<div v-if="video" class="container-xl">
					<AppSpacer v-if="!Screen.isXs" vertical :scale="4" />

					<div class="full-bleed-xs">
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
								<div class="_video-preview">
									<AppJolticon icon="video" big class="_video-preview-icon" />
								</div>
							</AppResponsiveDimensions>
							<br />
							<div class="alert alert-notice">{{ videoProcessingErrorMsg }}</div>
						</template>
					</div>
				</div>

				<AppPostPageContent
					v-if="background"
					:post="post"
					:sticker-target-controller="stickerTargetController"
					:community-notifications="communityNotifications"
				>
					<template #sticker-scroll>
						<!--
							Indicates where sticker placements may begin for scrolling when they show
							stickers.
						-->
						<div ref="stickerScroll" />
					</template>
				</AppPostPageContent>
			</AppBackground>

			<AppPageContainer xl>
				<template #default>
					<AppPostPageContent
						v-if="!background"
						:post="post"
						:sticker-target-controller="stickerTargetController"
						:community-notifications="communityNotifications"
					>
						<template #sticker-scroll>
							<!--
								Indicates where sticker placements may begin for scrolling when they show
								stickers.
							-->
							<div ref="stickerScroll" />
						</template>
					</AppPostPageContent>

					<br />

					<div class="post-view">
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
						<AppPollVoting :post="post" :poll="post.poll!" />

						<br />
					</AppStickerControlsOverlay>

					<AppStickerControlsOverlay
						v-if="
							communities.length ||
							realms.length ||
							post.supporters.length ||
							post.sticker_counts.length
						"
					>
						<AppStickerPlacementList
							v-if="!isDynamicGoogleBot()"
							:sticker-target-controller="stickerTargetController"
							:supporters="post.supporters"
							:stickers="post.sticker_counts"
							@show="scrollToStickers()"
						/>

						<AppContentTargets :communities="communities" :realms="realms" has-links />

						<template v-if="shouldShowCommunityPublishError">
							<br />
							<div class="well fill-offset">
								<AppJolticon icon="notice" notice />
								<span>
									{{
										$gettext(
											`You can't publish this post to the selected community channel because you don't have permissions to post into that specific channel. Please select a different channel.`
										)
									}}
								</span>
							</div>
						</template>

						<div class="_controls-spacing" />
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

					<br />

					<div v-if="Screen.isMobile">
						<AppPostPageRecommendations :key="post.id" :post="post" />
					</div>
					<br />
					<AppCommentDisabledCheck :model="post">
						<AppCommentWidgetLazy :model="post" display-mode="comments" />
					</AppCommentDisabledCheck>
				</template>

				<template v-if="!Screen.isMobile" #right>
					<div class="_side-col">
						<div class="_share">
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

._controls-spacing
	padding-bottom: $-controls-spacing-xs

	@media $media-sm-up
		padding-bottom: $-controls-spacing

._side-col
	@media $media-lg-up
		margin-left: 50px

._share
	margin-top: $line-height-computed * 1.5

._sans-padding-top
	padding-top: 0

._video-preview
	change-bg('bg-offset')
	rounded-corners-lg()
	overflow: hidden
	position: relative
	height: 100%
	display: flex
	justify-content: center
	align-items: center

._video-preview-icon
	filter: drop-shadow(0 0 5px rgba(0, 0, 0, 1))
</style>
