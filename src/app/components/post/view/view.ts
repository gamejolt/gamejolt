import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';
import AppAdWidget from '../../../../_common/ad/widget/widget.vue';
import AppCommunityPill from '../../../../_common/community/pill/pill.vue';
import AppContentViewer from '../../../../_common/content/content-viewer/content-viewer.vue';
import { FiresidePost } from '../../../../_common/fireside/post/post-model';
import { Growls } from '../../../../_common/growls/growls.service';
import { AppImgResponsive } from '../../../../_common/img/responsive/responsive';
import AppLightboxTS from '../../../../_common/lightbox/lightbox';
import { createLightbox, LightboxMediaSource } from '../../../../_common/lightbox/lightbox-helpers';
import AppMediaItemBackdrop from '../../../../_common/media-item/backdrop/backdrop.vue';
import { MediaItem } from '../../../../_common/media-item/media-item-model';
import AppMediaItemPost from '../../../../_common/media-item/post/post.vue';
import { AppResponsiveDimensions } from '../../../../_common/responsive-dimensions/responsive-dimensions';
import { Screen } from '../../../../_common/screen/screen-service';
import { AppScrollWhen } from '../../../../_common/scroll/scroll-when.directive';
import { Scroll } from '../../../../_common/scroll/scroll.service';
import AppScrollScroller from '../../../../_common/scroll/scroller/scroller.vue';
import { Settings } from '../../../../_common/settings/settings.service';
import AppSketchfabEmbed from '../../../../_common/sketchfab/embed/embed.vue';
import AppStickerTargetTS from '../../../../_common/sticker/target/target';
import AppStickerTarget from '../../../../_common/sticker/target/target.vue';
import { AppTimeAgo } from '../../../../_common/time/ago/ago';
import AppVideoEmbed from '../../../../_common/video/embed/embed.vue';
import AppVideo from '../../../../_common/video/video.vue';
import { Store } from '../../../store';
import AppEventItemControls from '../../event-item/controls/controls.vue';
import AppPollVoting from '../../poll/voting/voting.vue';
import AppPostViewPlaceholder from './placeholder/placeholder.vue';

@Component({
	components: {
		AppPostViewPlaceholder,
		AppTimeAgo,
		AppResponsiveDimensions,
		AppImgResponsive,
		AppMediaItemBackdrop,
		AppVideo,
		AppVideoEmbed,
		AppSketchfabEmbed,
		AppEventItemControls,
		AppPollVoting,
		AppAdWidget,
		AppCommunityPill,
		AppContentViewer,
		AppStickerTarget,
		AppMediaItemPost,
		AppScrollScroller,
	},
	directives: {
		AppScrollWhen,
	},
})
export default class AppPostView extends Vue implements LightboxMediaSource {
	@Prop(FiresidePost)
	post!: FiresidePost;

	@Prop(Boolean)
	showGameInfo?: boolean;

	@State
	app!: Store['app'];

	stickersVisible = false;
	activeImageIndex = 0;
	private lightbox?: AppLightboxTS;

	$refs!: {
		stickerTarget: AppStickerTargetTS;
	};

	readonly Screen = Screen;

	get communities() {
		return (this.post && this.post.communities) || [];
	}

	get shouldShowManage() {
		return (
			(this.app.user && this.app.user.isMod) ||
			(this.post && this.post.isManageableByUser(this.app.user))
		);
	}

	get shouldShowAds() {
		// Only show ads for game posts. The game will set the page settings for
		// whether or not it should show an ad for this game page, so no need to
		// do that here.
		return this.post && this.post.game;
	}

	get shouldShowCommunityPublishError() {
		return (
			this.post.status === FiresidePost.STATUS_DRAFT && !this.post.canPublishToCommunities()
		);
	}

	created() {
		if (!GJ_IS_SSR) {
			this.stickersVisible = Settings.get('always-show-stickers');
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

	onPostStickersVisibilityChange(visible: boolean) {
		this.stickersVisible = visible;
		// Scroll to the sticker target to show stickers.
		if (visible) {
			Scroll.to(this.$refs.stickerTarget.$el as HTMLElement, { preventDirections: ['down'] });
		}
	}

	onAllStickersHidden() {
		this.stickersVisible = false;
	}

	onClickFullscreen(mediaItem: MediaItem) {
		this.activeImageIndex = this.post.media.findIndex(i => i.id === mediaItem.id);
		this.createLightbox();
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
