import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { RawLocation } from 'vue-router';
import { propRequired } from '../../../../utils/vue';
import AppAdWidget from '../../../../_common/ad/widget/widget.vue';
import AppCommunityPill from '../../../../_common/community/pill/pill.vue';
import AppContentViewer from '../../../../_common/content/content-viewer/content-viewer.vue';
import AppEventItemControlsOverlay from '../../../../_common/event-item/controls-overlay/controls-overlay.vue';
import { number } from '../../../../_common/filters/number';
import { FiresidePost } from '../../../../_common/fireside/post/post-model';
import {
	$viewPostVideo,
	FiresidePostVideo,
} from '../../../../_common/fireside/post/video/video-model';
import { Growls } from '../../../../_common/growls/growls.service';
import { AppImgResponsive } from '../../../../_common/img/responsive/responsive';
import AppLightboxTS from '../../../../_common/lightbox/lightbox';
import { createLightbox, LightboxMediaSource } from '../../../../_common/lightbox/lightbox-helpers';
import AppMediaItemBackdrop from '../../../../_common/media-item/backdrop/backdrop.vue';
import { MediaItem } from '../../../../_common/media-item/media-item-model';
import AppMediaItemPost from '../../../../_common/media-item/post/post.vue';
import {
	AppResponsiveDimensions,
	AppResponsiveDimensionsChangeEvent,
} from '../../../../_common/responsive-dimensions/responsive-dimensions';
import { Screen } from '../../../../_common/screen/screen-service';
import AppScrollScroller from '../../../../_common/scroll/scroller/scroller.vue';
import AppSketchfabEmbed from '../../../../_common/sketchfab/embed/embed.vue';
import AppStickerReactions from '../../../../_common/sticker/reactions/reactions.vue';
import { StickerTargetController } from '../../../../_common/sticker/target/target-controller';
import AppStickerTarget from '../../../../_common/sticker/target/target.vue';
import { AppState, AppStore } from '../../../../_common/store/app-store';
import { AppTimeAgo } from '../../../../_common/time/ago/ago';
import { AppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import AppUserCardHover from '../../../../_common/user/card/hover/hover.vue';
import AppUserFollowWidget from '../../../../_common/user/follow/widget.vue';
import AppUserAvatar from '../../../../_common/user/user-avatar/user-avatar.vue';
import AppUserVerifiedTick from '../../../../_common/user/verified-tick/verified-tick.vue';
import AppVideoEmbed from '../../../../_common/video/embed/embed.vue';
import AppVideoPlayer from '../../../../_common/video/player/player.vue';
import AppVideoProcessingProgress from '../../../../_common/video/processing-progress/processing-progress.vue';
import AppVideo from '../../../../_common/video/video.vue';
import AppEventItemControls from '../../../components/event-item/controls/controls.vue';
import AppGameBadge from '../../../components/game/badge/badge.vue';
import AppGameListItem from '../../../components/game/list/item/item.vue';
import { AppCommentWidgetLazy } from '../../../components/lazy';
import AppPollVoting from '../../../components/poll/voting/voting.vue';

@Component({
	components: {
		AppTimeAgo,
		AppResponsiveDimensions,
		AppImgResponsive,
		AppVideo,
		AppVideoPlayer,
		AppVideoEmbed,
		AppSketchfabEmbed,
		AppEventItemControls,
		AppEventItemControlsOverlay,
		AppPollVoting,
		AppAdWidget,
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
	},
	directives: {
		AppTooltip,
	},
})
export default class AppPostPage extends Vue implements LightboxMediaSource {
	@Prop(propRequired(FiresidePost)) post!: FiresidePost;

	@AppState user!: AppStore['user'];

	activeImageIndex = 0;
	videoStartTime = 0;
	isPlayerFilled = false;
	stickerTargetController = new StickerTargetController(this.post);
	private lightbox?: AppLightboxTS;

	readonly Screen = Screen;
	readonly number = number;

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

	get deviceMaxHeight() {
		if (GJ_IS_SSR) {
			return;
		}

		if (Screen.isMobile) {
			return window.screen.height - 150;
		}
		return Screen.height - 150;
	}

	onPlayerSizeChange(event: AppResponsiveDimensionsChangeEvent) {
		this.isPlayerFilled = event.isFilled;
	}

	created() {
		if (GJ_IS_SSR) {
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
			} as RawLocation);
		}
	}

	destroyed() {
		this.closeLightbox();
	}

	onLightboxClose() {
		this.lightbox = undefined;
	}

	getActiveIndex() {
		return this.activeImageIndex;
	}

	getActiveItem() {
		return this.post.media[this.activeImageIndex];
	}

	getItemCount() {
		return this.post.media.length;
	}

	getItems() {
		return this.post.media;
	}

	goNext() {
		this.activeImageIndex = Math.min(this.activeImageIndex + 1, this.post.media.length - 1);
	}

	goPrev() {
		this.activeImageIndex = Math.max(this.activeImageIndex - 1, 0);
	}

	onProcessingComplete(payload: any) {
		if (payload.video && this.video) {
			this.video.assign(payload.video);
		}
	}

	onPostRemoved() {
		this.$router.replace({ name: 'home' });
		Growls.info(this.$gettext('Your post has been removed'));
	}

	onPostPublished() {
		Growls.success({
			title: this.$gettext('Huzzah!'),
			message: this.$gettext('Your post has been published.'),
		});
	}

	onClickFullscreen(mediaItem: MediaItem) {
		this.activeImageIndex = this.post.media.findIndex(i => i.id === mediaItem.id);
		this.createLightbox();
	}

	onVideoPlay() {
		if (this.video) {
			$viewPostVideo(this.video);
		}
	}

	private createLightbox() {
		if (this.lightbox) {
			return;
		}
		this.lightbox = createLightbox(this);
	}

	private closeLightbox() {
		if (!this.lightbox) {
			return;
		}
		this.lightbox.close();
		this.lightbox = undefined;
	}
}
