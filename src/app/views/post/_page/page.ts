import { computed } from 'vue';
import { setup } from 'vue-class-component';
import { Emit, Options, Prop, Provide, Vue, Watch } from 'vue-property-decorator';
import { RouteLocationRaw } from 'vue-router';
import { arrayRemove } from '../../../../utils/array';
import { Api } from '../../../../_common/api/api.service';
import AppCommunityPill from '../../../../_common/community/pill/pill.vue';
import { CommunityUserNotification } from '../../../../_common/community/user-notification/user-notification.model';
import AppContentViewer from '../../../../_common/content/content-viewer/content-viewer.vue';
import { formatNumber } from '../../../../_common/filters/number';
import { FiresidePost } from '../../../../_common/fireside/post/post-model';
import {
	$viewPostVideo,
	FiresidePostVideo,
} from '../../../../_common/fireside/post/video/video-model';
import { showInfoGrowl, showSuccessGrowl } from '../../../../_common/growls/growls.service';
import { AppImgResponsive } from '../../../../_common/img/responsive/responsive';
import { createLightbox } from '../../../../_common/lightbox/lightbox-helpers';
import AppMediaItemBackdrop from '../../../../_common/media-item/backdrop/backdrop.vue';
import { MediaItem } from '../../../../_common/media-item/media-item-model';
import AppMediaItemPost from '../../../../_common/media-item/post/post.vue';
import { Screen } from '../../../../_common/screen/screen-service';
import { Scroll } from '../../../../_common/scroll/scroll.service';
import AppScrollScroller from '../../../../_common/scroll/scroller/scroller.vue';
import AppStickerControlsOverlay from '../../../../_common/sticker/controls-overlay/controls-overlay.vue';
import AppStickerReactions from '../../../../_common/sticker/reactions/reactions.vue';
import {
	StickerTargetController,
	StickerTargetParentControllerKey,
} from '../../../../_common/sticker/target/target-controller';
import AppStickerTarget from '../../../../_common/sticker/target/target.vue';
import { AppState, AppStore } from '../../../../_common/store/app-store';
import { AppTimeAgo } from '../../../../_common/time/ago/ago';
import { AppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import AppUserCardHover from '../../../../_common/user/card/hover/hover.vue';
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
import AppPageContainer from '../../../components/page-container/page-container.vue';
import AppPollVoting from '../../../components/poll/voting/voting.vue';
import AppPostControls from '../../../components/post/controls/controls.vue';
import AppPostPageRecommendations from './recommendations/recommendations.vue';

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
	},
	directives: {
		AppTooltip,
	},
})
export default class AppPostPage extends Vue {
	@Prop({ type: FiresidePost, required: true })
	post!: FiresidePost;

	@Prop({ type: Array, required: false, default: () => [] })
	communityNotifications!: CommunityUserNotification[];

	@Emit('post-updated')
	emitPostUpdated(_post: FiresidePost) {}

	@AppState user!: AppStore['user'];

	@Provide({ to: StickerTargetParentControllerKey, reactive: true })
	stickerTargetController = new StickerTargetController(this.post);

	recommendedPosts: FiresidePost[] = [];
	videoStartTime = 0;
	isPlayerFilled = false;

	private lightbox = setup(() => {
		return createLightbox(computed(() => (this.$props as this).post.media));
	});

	readonly Screen = Screen;
	readonly formatNumber = formatNumber;

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

	created() {
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

	mounted() {
		this.fetchRecommendedPosts();
	}

	@Watch('post.id')
	onPostChange() {
		this.stickerTargetController = new StickerTargetController(this.post);
		this.fetchRecommendedPosts();
	}

	async fetchRecommendedPosts() {
		this.recommendedPosts = [];

		const payload = await Api.sendRequest(
			`/web/posts/recommendations/${this.post.id}`,
			undefined,
			{ detach: true }
		);

		this.recommendedPosts = FiresidePost.populate(payload.posts);
	}

	onVideoProcessingComplete(payload: any) {
		if (payload.video && this.video) {
			this.video.assign(payload.video);
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
