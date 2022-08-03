<script lang="ts">
import { computed } from 'vue';
import { setup } from 'vue-class-component';
import { Emit, Options, Prop, Vue, Watch } from 'vue-property-decorator';
import { RouteLocationRaw } from 'vue-router';
import { arrayRemove } from '../../../../utils/array';
import AppAdWidget from '../../../../_common/ad/widget/AppAdWidget.vue';
import { trackExperimentEngagement } from '../../../../_common/analytics/analytics.service';
import AppBackground from '../../../../_common/background/AppBackground.vue';
import AppCommunityPill from '../../../../_common/community/pill/pill.vue';
import { CommunityUserNotification } from '../../../../_common/community/user-notification/user-notification.model';
import { configPostShareSide } from '../../../../_common/config/config.service';
import AppContentViewer from '../../../../_common/content/content-viewer/content-viewer.vue';
import { formatNumber } from '../../../../_common/filters/number';
import { FiresidePost } from '../../../../_common/fireside/post/post-model';
import {
	$viewPostVideo,
	FiresidePostVideo,
} from '../../../../_common/fireside/post/video/video-model';
import { showInfoGrowl, showSuccessGrowl } from '../../../../_common/growls/growls.service';
import AppImgResponsive from '../../../../_common/img/AppImgResponsive.vue';
import { createLightbox } from '../../../../_common/lightbox/lightbox-helpers';
import AppMediaItemBackdrop from '../../../../_common/media-item/backdrop/AppMediaItemBackdrop.vue';
import { MediaItem } from '../../../../_common/media-item/media-item-model';
import AppMediaItemPost from '../../../../_common/media-item/post/post.vue';
import AppResponsiveDimensions from '../../../../_common/responsive-dimensions/AppResponsiveDimensions.vue';
import { Screen } from '../../../../_common/screen/screen-service';
import AppScrollScroller from '../../../../_common/scroll/AppScrollScroller.vue';
import { Scroll } from '../../../../_common/scroll/scroll.service';
import AppShareCard from '../../../../_common/share/card/AppShareCard.vue';
import AppSpacer from '../../../../_common/spacer/AppSpacer.vue';
import AppStickerControlsOverlay from '../../../../_common/sticker/AppStickerControlsOverlay.vue';
import AppStickerLayer from '../../../../_common/sticker/layer/AppStickerLayer.vue';
import AppStickerReactions from '../../../../_common/sticker/reactions/AppStickerReactions.vue';
import AppStickerTarget from '../../../../_common/sticker/target/AppStickerTarget.vue';
import {
	createStickerTargetController,
	provideStickerTargerController,
	StickerTargetController,
} from '../../../../_common/sticker/target/target-controller';
import { useCommonStore } from '../../../../_common/store/common-store';
import { AppTimeAgo } from '../../../../_common/time/ago/ago';
import { vAppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import AppUserCardHover from '../../../../_common/user/card/AppUserCardHover.vue';
import AppUserFollowWidget from '../../../../_common/user/follow/widget.vue';
import AppUserAvatar from '../../../../_common/user/user-avatar/user-avatar.vue';
import AppUserVerifiedTick from '../../../../_common/user/verified-tick/verified-tick.vue';
import AppVideoPlayer from '../../../../_common/video/player/player.vue';
import AppVideoProcessingProgress from '../../../../_common/video/processing-progress/processing-progress.vue';
import AppVideo from '../../../../_common/video/video.vue';
import AppCommunityUserNotification from '../../../components/community/user-notification/user-notification.vue';
import AppFiresidePostEmbed from '../../../components/fireside/post/embed/embed.vue';
import AppGameBadge from '../../../components/game/badge/badge.vue';
import AppGameListItem from '../../../components/game/list/item/item.vue';
import { AppCommentWidgetLazy } from '../../../components/lazy';
import AppPageContainer from '../../../components/page-container/AppPageContainer.vue';
import AppPollVoting from '../../../components/poll/voting/voting.vue';
import AppActivityFeedPostContent from '../../../components/post/AppPostContent.vue';
import AppPostHeader from '../../../components/post/AppPostHeader.vue';
import AppPostControls from '../../../components/post/controls/AppPostControls.vue';
import AppPostPageRecommendations from './recommendations/AppPostPageRecommendations.vue';

const UserFollowLocation = 'postPage';

@Options({
	components: {
		AppPageContainer,
		AppTimeAgo,
		AppImgResponsive,
		AppVideo,
		AppVideoPlayer,
		AppPostControls,
		AppStickerControlsOverlay,
		AppPollVoting,
		AppCommunityPill,
		AppContentViewer,
		AppUserCardHover,
		AppUserAvatar,
		AppUserFollowWidget,
		AppGameListItem,
		AppStickerTarget,
		AppStickerReactions,
		AppMediaItemBackdrop,
		AppMediaItemPost,
		AppScrollScroller,
		AppGameBadge,
		AppUserVerifiedTick,
		AppVideoProcessingProgress,
		AppCommentWidgetLazy,
		AppCommunityUserNotification,
		AppFiresidePostEmbed,
		AppPostPageRecommendations,
		AppShareCard,
		AppBackground,
		AppPostHeader,
		AppActivityFeedPostContent,
		AppSpacer,
		AppResponsiveDimensions,
		AppAdWidget,
		AppStickerLayer,
	},
	directives: {
		AppTooltip: vAppTooltip,
	},
})
export default class AppPostPage extends Vue {
	@Prop({ type: Object, required: true })
	post!: FiresidePost;

	@Prop({ type: Array, required: false, default: () => [] })
	communityNotifications!: CommunityUserNotification[];

	@Emit('post-updated')
	emitPostUpdated(_post: FiresidePost) {}

	commonStore = setup(() => useCommonStore());

	get user() {
		return this.commonStore.user;
	}

	stickerTargetController!: StickerTargetController;

	recommendedPosts: FiresidePost[] = [];
	videoStartTime = 0;
	isPlayerFilled = false;
	hasVideoProcessingError = false;
	videoProcessingErrorMsg = '';

	private lightbox = setup(() => {
		return createLightbox(computed(() => (this.$props as this).post.media));
	});

	readonly Screen = Screen;
	readonly formatNumber = formatNumber;
	readonly UserFollowLocation = UserFollowLocation;

	declare $refs: {
		'sticker-scroll': HTMLDivElement;
	};

	get displayUser() {
		return this.post.displayUser;
	}

	get communities() {
		return this.post.communities || [];
	}

	get shouldShowManage() {
		return this.user?.isMod || this.post.isManageableByUser(this.user);
	}

	get shouldShowCommunityPublishError() {
		return (
			this.post.status === FiresidePost.STATUS_DRAFT && !this.post.canPublishToCommunities()
		);
	}

	get video(): null | FiresidePostVideo {
		return this.post.videos[0] ?? null;
	}

	get background() {
		return this.post.background;
	}

	get shareCardOnSide() {
		trackExperimentEngagement(configPostShareSide);
		return configPostShareSide.value;
	}

	created() {
		this.stickerTargetController = createStickerTargetController(this.post, {
			isCreator: computed(() => this.post.displayUser.is_creator),
		});
		provideStickerTargerController(this.stickerTargetController);

		if (import.meta.env.SSR) {
			return;
		}

		if (typeof this.$route.query.t === 'string') {
			if (this.video) {
				// DODO: Set the max val to the video end time.
				this.videoStartTime =
					Math.floor(Math.max(0, parseInt(this.$route.query.t, 10))) * 1000;
			}

			// Get rid of the time from the URL so that it doesn't pollute
			// shared addresses.
			this.$router.replace({
				...this.$route,
				query: { ...this.$route.query, t: undefined },
			} as RouteLocationRaw);
		}
	}

	@Watch('post.id')
	onPostChange() {
		this.stickerTargetController = createStickerTargetController(this.post, {
			isCreator: computed(() => this.post.displayUser.is_creator),
		});
	}

	onVideoProcessingComplete(payload: any) {
		if (payload.video && this.video) {
			this.video.assign(payload.video);
		}
	}

	onVideoProcessingError(err: string | Error) {
		if (typeof err === 'string') {
			this.hasVideoProcessingError = true;
			this.videoProcessingErrorMsg = err;
		} else {
			// The only cases where an actual error is emitted is on network error during polling.
			// This does not necessarily mean an actual error during processing, so noop.
		}
	}

	onPostRemoved() {
		this.$router.replace({ name: 'home' });
		showInfoGrowl(this.$gettext('Your post has been removed'));
	}

	onPostPublished() {
		showSuccessGrowl({
			title: this.$gettext('Huzzah!'),
			message: this.$gettext('Your post has been published.'),
		});
	}

	onClickFullscreen(mediaItem: MediaItem) {
		const index = this.post.media.findIndex(i => i.id === mediaItem.id);
		this.lightbox.show(index !== -1 ? index : null);
	}

	onVideoPlay() {
		if (this.video) {
			$viewPostVideo(this.video);
		}
	}

	scrollToStickers() {
		Scroll.to(this.$refs['sticker-scroll'], { preventDirections: ['down'] });
	}

	onDismissNotification(notification: CommunityUserNotification) {
		arrayRemove(this.communityNotifications, i => i.id === notification.id);
	}
}
</script>

<template>
	<!--
	A lot of components on this page don't properly respond to inputs changing,
	so key on the post ID so that everything gets recompiled when switching
	posts.
	-->
	<AppStickerLayer>
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

									<router-link :to="displayUser.url" class="-name link-unstyled">
										<span>
											<strong>{{ displayUser.display_name }}</strong>
											<AppUserVerifiedTick :user="displayUser" />
										</span>
										<span class="tiny text-muted"
											>@{{ displayUser.username }}</span
										>
									</router-link>

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
						v-if="communities.length || post.sticker_counts.length"
					>
						<AppStickerReactions
							v-if="post.sticker_counts.length"
							:controller="stickerTargetController"
							@show="scrollToStickers()"
						/>

						<AppScrollScroller class="-communities" horizontal thin>
							<AppCommunityPill
								v-for="postCommunity of communities"
								:key="postCommunity.id"
								:community-link="postCommunity"
							/>
						</AppScrollScroller>

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

					<div v-if="!shareCardOnSide" class="-share">
						<AppShareCard resource="post" :url="post.url" offset-color />
					</div>

					<div v-if="Screen.isMobile">
						<AppPostPageRecommendations :key="post.id" :post="post" />
					</div>

					<br />
					<br />
					<AppCommentWidgetLazy :model="post" display-mode="comments" />
				</template>

				<template v-if="!Screen.isMobile" #right>
					<div class="-side-col">
						<div v-if="shareCardOnSide" class="-share">
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
