<script lang="ts">
import { nextTick } from 'vue';
import { Options, Prop, Vue, Watch } from 'vue-property-decorator';
import { PostOpenSource, trackPostOpen } from '../../../../../_common/analytics/analytics.service';
import { ContentFocus } from '../../../../../_common/content-focus/content-focus.service';
import AppContentViewer from '../../../../../_common/content/content-viewer/content-viewer.vue';
import { Environment } from '../../../../../_common/environment/environment.service';
import AppFadeCollapse from '../../../../../_common/fade-collapse/fade-collapse.vue';
import { formatFuzzynumber } from '../../../../../_common/filters/fuzzynumber';
import { FiresidePost } from '../../../../../_common/fireside/post/post-model';
import { AppImgResponsive } from '../../../../../_common/img/responsive/responsive';
import AppLoading from '../../../../../_common/loading/loading.vue';
import AppMediaItemBackdrop from '../../../../../_common/media-item/backdrop/backdrop.vue';
import { MediaItem } from '../../../../../_common/media-item/media-item-model';
import { AppObserveDimensions } from '../../../../../_common/observe-dimensions/observe-dimensions.directive';
import { AppResponsiveDimensions } from '../../../../../_common/responsive-dimensions/responsive-dimensions';
import { Screen } from '../../../../../_common/screen/screen-service';
import AppScrollInview, {
	ScrollInviewConfig,
} from '../../../../../_common/scroll/inview/AppScrollInview.vue';
import AppUserAvatar from '../../../../../_common/user/user-avatar/user-avatar.vue';
import {
	createVideoPlayerController,
	getVideoPlayerFromSources,
	VideoPlayerController,
	VideoPlayerControllerContext,
} from '../../../../../_common/video/player/controller';
import AppVideo from '../../../../../_common/video/video.vue';

const _InviewConfig = new ScrollInviewConfig({ margin: `${Screen.height}px` });

export const AppPostCardAspectRatio = 10 / 16;

@Options({
	components: {
		AppContentViewer,
		AppImgResponsive,
		AppLoading,
		AppMediaItemBackdrop,
		AppResponsiveDimensions,
		AppScrollInview,
		AppUserAvatar,
		AppVideo,
		AppFadeCollapse,
	},
	directives: {
		AppObserveDimensions,
	},
})
export default class AppPostCard extends Vue {
	@Prop({ type: Object, required: true })
	post!: FiresidePost;

	@Prop({ type: String, required: true })
	source!: PostOpenSource;

	@Prop({ type: String, required: false, default: null })
	videoContext!: VideoPlayerControllerContext;

	@Prop({ type: Boolean, required: false, default: false })
	withUser!: boolean;

	declare $el: HTMLElement;
	declare $refs: {
		card: HTMLElement;
	};

	readonly formatFuzzynumber = formatFuzzynumber;
	readonly InviewConfig = _InviewConfig;

	readonly aspectRatio = AppPostCardAspectRatio;

	videoController: VideoPlayerController | null = null;

	isImageThinner = false;
	isVideoThinner = false;

	cardWidth = '100%';
	cardHeight = '100%';
	imageWidth = '100%';
	imageHeight = '100%';
	videoWidth = '100%';
	videoHeight = '100%';
	leadHeight = 0;

	isBootstrapped = import.meta.env.SSR;
	isHydrated = import.meta.env.SSR;

	get shouldPlayVideo() {
		return this.isHydrated && ContentFocus.hasFocus;
	}

	get mediaItem() {
		if (this.post?.hasMedia) {
			return this.post.media[0];
		} else if (this.post?.hasVideo) {
			return this.post.videos[0].posterMediaItem;
		}
		return undefined;
	}

	get video() {
		if (!this.post?.hasVideo) {
			return undefined;
		}

		return this.post?.videos[0].media.find(i => i.type == MediaItem.TYPE_TRANSCODED_VIDEO_CARD);
	}

	get votedOnPoll() {
		const poll = this.post?.poll;
		for (let i = 0; i < (poll?.items.length ?? 0); i++) {
			if (poll?.items[i].is_voted) {
				return true;
			}
		}
		return false;
	}

	get likedPost() {
		if (this.post?.user_like) {
			return true;
		}
		return false;
	}

	get userLink() {
		return Environment.wttfBaseUrl + this.post?.user.url;
	}

	mounted() {
		this.calcData();
	}

	async calcData() {
		// Safari browsers don't always get the right initial dimensions if we don't do this.
		await nextTick();

		const cardWidth = this.$el.offsetWidth;
		const cardHeight = this.$el.offsetHeight ?? cardWidth / this.aspectRatio;
		const cardRatio = cardWidth / cardHeight;

		this.cardWidth = cardWidth + 'px';
		this.cardHeight = cardHeight + 'px';

		// Add in some space for the details on the bottom.
		this.leadHeight = cardHeight - 40;

		const media = this.mediaItem;
		if (!media) {
			return;
		}

		const mediaWidth = media.croppedWidth;
		const mediaHeight = media.croppedHeight;
		const mediaRatio = mediaWidth / mediaHeight;
		this.isImageThinner = mediaRatio < cardRatio;

		if (this.video) {
			const videoWidth = this.video.croppedWidth;
			const videoHeight = this.video.croppedHeight;
			const videoRatio = videoWidth / videoHeight;

			this.isVideoThinner = videoRatio < cardRatio;
		}

		const posterRatio = media.croppedWidth / media.croppedHeight;
		const videoRatio = this.video
			? this.video.croppedWidth / this.video.croppedHeight
			: posterRatio;

		let width;
		let height;

		let videoWidth;
		let videoHeight;

		if (this.isImageThinner) {
			width = cardWidth;
			height = width / posterRatio;
		} else {
			height = cardHeight;
			width = height * posterRatio;
		}

		if (this.isVideoThinner) {
			videoWidth = cardWidth;
			videoHeight = videoWidth / videoRatio;
		} else {
			videoHeight = cardHeight;
			videoWidth = videoHeight * videoRatio;
		}

		this.imageWidth = width + 'px';
		this.imageHeight = height + 'px';
		this.videoWidth = videoWidth + 'px';
		this.videoHeight = videoHeight + 'px';
	}

	inView() {
		this.isBootstrapped = true;
		this.isHydrated = true;
	}

	outView() {
		this.isHydrated = false;
	}

	@Watch('shouldPlayVideo')
	setupVideoController() {
		if (this.videoController) {
			return;
		}

		if (this.post?.hasVideo && this.post.videos[0].postCardVideo) {
			this.videoController = createVideoPlayerController(
				this.post.videos[0].postCardVideo,
				this.videoContext
			);

			this.videoController.volume = 0;
			this.videoController.muted = true;
		} else if (this.mediaItem?.is_animated) {
			const sourcesPayload = {
				mp4: this.mediaItem.mediaserver_url_mp4,
				webm: this.mediaItem.mediaserver_url_webm,
			};

			this.videoController = getVideoPlayerFromSources(sourcesPayload, 'gif');
		}
	}

	trackPostOpen() {
		trackPostOpen({ source: this.source });
	}
}
</script>

<template>
	<div v-if="post" class="post-card">
		<app-responsive-dimensions :ratio="aspectRatio" @change="calcData()">
			<app-scroll-inview
				:config="InviewConfig"
				:style="{
					width: cardWidth,
					height: cardHeight,
					'padding-top': GJ_IS_SSR ? (1 / aspectRatio) * 100 + '%' : null,
				}"
				@inview="inView"
				@outview="outView"
			>
				<div ref="card" class="-inner">
					<template v-if="!!mediaItem">
						<div class="-inner-media">
							<app-media-item-backdrop class="-backdrop" :media-item="mediaItem">
								<app-img-responsive
									class="-img"
									:src="mediaItem.mediaserver_url"
									alt=""
									:style="{
										width: imageWidth,
										height: imageHeight,
									}"
								/>
							</app-media-item-backdrop>

							<template v-if="videoController && isHydrated">
								<app-video
									class="-video"
									:player="videoController"
									:should-play="shouldPlayVideo"
									allow-degraded-autoplay
									:style="{
										width: videoWidth,
										height: videoHeight,
									}"
								/>
							</template>
						</div>
						<div class="-inner-gradient" />
					</template>

					<template v-else>
						<app-fade-collapse
							class="-inner-message"
							:collapse-height="leadHeight"
							ignore-threshold
							size="sm"
						>
							<app-content-viewer :source="post.lead_content" />
						</app-fade-collapse>
					</template>

					<router-link class="-link" :to="post.routeLocation" @click="trackPostOpen()" />

					<div class="-details" :class="{ '-light': !!mediaItem }">
						<template v-if="withUser">
							<app-user-avatar class="-details-user-avatar" :user="post.user" />
							<a class="-details-user-name" :href="userLink">
								@{{ post.user.username }}
							</a>
						</template>

						<span class="-details-spacer" />

						<template v-if="post.scheduled_for">
							<app-jolticon icon="calendar" />
						</template>

						<template v-if="post.hasPoll">
							<app-jolticon
								:class="{ '-voted': votedOnPoll }"
								icon="pedestals-numbers"
							/>
						</template>

						<template v-if="post.is_pinned">
							<app-jolticon icon="thumbtack" />
						</template>

						<app-jolticon icon="heart-filled" :class="{ '-liked': likedPost }" />
						<span class="-details-likes">
							{{ formatFuzzynumber(post.like_count) }}
						</span>
					</div>
				</div>
			</app-scroll-inview>
		</app-responsive-dimensions>
	</div>
</template>

<style lang="stylus" scoped>
@import './common'

$-base-width = 200px
$-padding = 8px

.-inner
	&
	&-media
		position: absolute
		left: 0
		top: 0
		right: 0
		bottom: 0

	&-media
		display: grid
		justify-content: center

	&-gradient
		position: absolute
		top: 0
		left: 0
		right: 0
		bottom: 0
		background: linear-gradient(to top, rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0), rgba(0, 0, 0, 0))

	&-message
		position: absolute
		left: $-padding
		top: $-padding
		right: $-padding
		bottom: $-padding

		::v-deep(.fireside-post-lead-content)
			font-size: ceil($font-size-base * 1.1)

.-light
	&
	> *
		color: var(--theme-white) !important
		text-shadow: black 1px 1px 4px

.-voted
.-liked
	color: $gj-overlay-notice !important

.-link
	rounded-corners-lg()
	position: absolute
	left: 0
	top: 0
	right: 0
	bottom: 0
	border: solid $border-width-base transparent

.-details
	position: absolute
	left: $-padding
	bottom: $-padding
	right: $-padding
	display: flex
	font-size: 13px
	font-weight: bold

	> *
		color: var(--theme-fg)

		&:not(&:last-child)
			margin-right: $-padding * 0.5

	> .jolticon
		justify-self: flex-end

	> .jolticon
	&-user-avatar
		flex: none
		width: 20px
		height: 20px

	&-user-name
		overflow: hidden
		text-overflow: ellipsis
		padding-right: $-padding * 0.5m
		margin-right: 0 !important
		white-space: nowrap

	&-spacer
		flex: auto

.-backdrop
	position: absolute
	top: 0
	left: 0
	right: 0
	bottom: 0
	display: flex
	align-items: center
	justify-content: center

.-img
	max-width: unset
	object-fit: cover

.-video
	display: flex
	justify-content: center
	align-items: center

	::v-deep(> video)
		height: 100% !important
		width: 100% !important
</style>
