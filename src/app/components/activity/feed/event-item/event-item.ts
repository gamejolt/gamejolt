import Vue from 'vue';
import { Component, Inject, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { findRequiredVueParent } from '../../../../../utils/vue';
import { CommentVideoModal } from '../../../../../_common/comment/video/modal/modal.service';
import { CommentVideo } from '../../../../../_common/comment/video/video-model';
import { CommunityChannel } from '../../../../../_common/community/channel/channel.model';
import { Community } from '../../../../../_common/community/community.model';
import AppCommunityPill from '../../../../../_common/community/pill/pill.vue';
import AppContentViewer from '../../../../../_common/content/content-viewer/content-viewer.vue';
import { Environment } from '../../../../../_common/environment/environment.service';
import { EventItem } from '../../../../../_common/event-item/event-item.model';
import AppFadeCollapse from '../../../../../_common/fade-collapse/fade-collapse.vue';
import { number } from '../../../../../_common/filters/number';
import { FiresidePostCommunity } from '../../../../../_common/fireside/post/community/community.model';
import { FiresidePost } from '../../../../../_common/fireside/post/post-model';
import { Navigate } from '../../../../../_common/navigate/navigate.service';
import AppPill from '../../../../../_common/pill/pill.vue';
import { Screen } from '../../../../../_common/screen/screen-service';
import { Scroll } from '../../../../../_common/scroll/scroll.service';
import { Settings } from '../../../../../_common/settings/settings.service';
import AppStickerTargetTS from '../../../../../_common/sticker/target/target';
import AppStickerTarget from '../../../../../_common/sticker/target/target.vue';
import AppUserCardHover from '../../../../../_common/user/card/hover/hover.vue';
import AppUserFollowWidget from '../../../../../_common/user/follow/widget.vue';
import AppUserAvatar from '../../../../../_common/user/user-avatar/user-avatar.vue';
import AppUserVerifiedTick from '../../../../../_common/user/verified-tick/verified-tick.vue';
import { Store } from '../../../../store';
import AppEventItemControls from '../../../event-item/controls/controls.vue';
import AppPollVoting from '../../../poll/voting/voting.vue';
import AppActivityFeedCommentVideo from '../comment-video/comment-video.vue';
import AppActivityFeedDevlogPostMedia from '../devlog-post/media/media.vue';
import AppActivityFeedDevlogPostSketchfab from '../devlog-post/sketchfab/sketchfab.vue';
import AppActivityFeedDevlogPostText from '../devlog-post/text/text.vue';
import AppActivityFeedDevlogPostVideo from '../devlog-post/video/video.vue';
import AppActivityFeedTS from '../feed';
import { feedShouldBlockPost, feedShouldBlockVideo } from '../feed-service';
import AppActivityFeed from '../feed.vue';
import { ActivityFeedItem } from '../item-service';
import { ActivityFeedView } from '../view';
import AppActivityFeedEventItemBlocked from './blocked/blocked.vue';
import AppActivityFeedEventItemTime from './time/time.vue';

const ResizeSensor = require('css-element-queries/src/ResizeSensor');

@Component({
	components: {
		AppActivityFeedEventItemTime,
		AppUserAvatar,
		AppUserFollowWidget,
		AppActivityFeedCommentVideo,
		AppActivityFeedDevlogPostText,
		AppActivityFeedDevlogPostMedia,
		AppActivityFeedDevlogPostSketchfab,
		AppActivityFeedDevlogPostVideo,
		AppEventItemControls,
		AppPollVoting,
		AppUserCardHover,
		AppFadeCollapse,
		AppCommunityPill,
		AppPill,
		AppContentViewer,
		AppUserVerifiedTick,
		AppActivityFeedEventItemBlocked,
		AppStickerTarget,
	},
	filters: {
		number,
	},
})
export default class AppActivityFeedEventItem extends Vue {
	@Inject()
	feed!: ActivityFeedView;

	@Prop(ActivityFeedItem)
	item!: ActivityFeedItem;

	@State
	app!: Store['app'];

	canToggleLead = false;
	hasBypassedBlock = false;
	stickersVisible = false;

	private resizeSensor?: any;
	private feedComponent!: AppActivityFeedTS;

	readonly Screen = Screen;
	readonly EventItem = EventItem;

	$el!: HTMLDivElement;

	$refs!: {
		stickerTarget: AppStickerTargetTS;
	};

	get isNew() {
		return this.feed.isItemUnread(this.item);
	}

	get isThreadView() {
		return !Screen.isXs;
	}

	get eventItem() {
		return this.item.feedItem as EventItem;
	}

	get isLeadOpen() {
		return this.feed.isItemLeadOpen(this.item);
	}

	get post() {
		if (this.eventItem.type === EventItem.TYPE_POST_ADD) {
			return this.eventItem.action as FiresidePost;
		}
	}

	get video() {
		if (this.eventItem.type === EventItem.TYPE_COMMENT_VIDEO_ADD) {
			return this.eventItem.action as CommentVideo;
		}
	}

	get user() {
		return this.eventItem.user;
	}

	get game() {
		return this.eventItem.game;
	}

	get gameUrl() {
		if (this.game) {
			return this.game.getUrl();
		}

		return undefined;
	}

	get communities() {
		return (this.post && this.post.communities) || [];
	}

	get link() {
		if (this.eventItem.type === EventItem.TYPE_COMMENT_VIDEO_ADD) {
			return null;
		}

		if (this.eventItem.type === EventItem.TYPE_GAME_PUBLISH) {
			const game = this.game!;

			const params: { [key: string]: string } = {
				slug: game.slug,
				id: game.id + '',
			};

			return {
				name: 'discover.games.view.overview',
				params: params,
			};
		} else if (this.eventItem.type === EventItem.TYPE_POST_ADD) {
			const post = this.post!;
			return post.routeLocation;
		}

		return null;
	}

	get linkResolved() {
		if (!this.link) {
			return '';
		}
		return this.$router.resolve(this.link).href;
	}

	get shouldShowFollow() {
		if (this.isBlocked || this.post?.user.blocked_you) {
			return false;
		}

		// Don't show follow for game posts. Only for user posts.
		if (!this.feed.shouldShowFollow || !this.post || this.post.game) {
			return false;
		}

		// Don't show follow if already following.
		if (!this.user || this.user.is_following) {
			return false;
		}

		return true;
	}

	get shouldShowManage() {
		return this.post && this.post.isManageableByUser(this.app.user);
	}

	get shouldShowCommunities() {
		if (!this.communities.length) {
			return false;
		}

		return !this.feed.hideCommunity || !this.feed.hideCommunityChannel;
	}

	get shouldShowIsPinned() {
		if (!this.post || !this.post.is_pinned) {
			return false;
		}

		return this.post.getPinContextFor(this.$route) !== null;
	}

	get isBlocked() {
		if (this.post) {
			return feedShouldBlockPost(this.post, this.$route);
		}
		if (this.video) {
			return feedShouldBlockVideo(this.video, this.$route);
		}
		return false;
	}

	get shouldBlock() {
		return !this.hasBypassedBlock && this.isBlocked;
	}

	created() {
		if (!GJ_IS_SSR) {
			this.stickersVisible = Settings.get('always-show-stickers');
		}
	}

	mounted() {
		this.feedComponent = findRequiredVueParent(this, AppActivityFeed) as AppActivityFeedTS;
	}

	destroyed() {
		this.feedComponent = undefined as any;
		this.resizeSensor = undefined;
	}

	/**
	 * Callback for when the component's content has finished bootstrapping into
	 * the DOM and we hopefully know the height and true content.
	 */
	onContentBootstrapped() {
		this.$emit('resize', this.$el.offsetHeight);
		this.resizeSensor =
			this.resizeSensor ||
			new ResizeSensor(this.$el, () => {
				this.$emit('resize', this.$el.offsetHeight);
			});
	}

	onExpand() {
		this.$emit('expanded');
	}

	/**
	 * Called when clicking on the item, before running through any other click events--in the
	 * capture phase.
	 */
	onClickCapture() {
		this.$emit('clicked');
	}

	/**
	 * Called when bubbling back up the click for the item. Any links within the item can cancel
	 * this.
	 */
	onClick(e: MouseEvent) {
		const ignoreList = ['a', 'button'];

		// This mess is because we have to search the parent chain to see if one of the elements is
		// in our ignored list.
		let target = e.target as HTMLElement;
		if (target instanceof HTMLElement) {
			while (true) {
				const nodeName = target.nodeName.toLowerCase();

				// Immediately stop if we hit the end.
				if ((target as any) === document || !target.parentNode) {
					break;
				}

				// If it's in our list of ignored elements, then just stop.
				if (ignoreList.indexOf(nodeName) !== -1) {
					return;
				}

				target = target.parentNode as HTMLAnchorElement;
			}
		}

		if (e.metaKey || e.altKey) {
			return;
		}

		if (this.video) {
			CommentVideoModal.show(this.video);
		} else {
			if (!this.link) {
				return;
			}

			if (e.ctrlKey || e.shiftKey) {
				Navigate.newWindow(Environment.wttfBaseUrl + this.linkResolved);
				return;
			}

			this.$router.push(this.link);
		}
	}

	onUnhideBlock() {
		this.hasBypassedBlock = true;
	}

	toggleLead() {
		this.feed.toggleItemLeadOpen(this.item);
		this.$emit('expanded');
	}

	canToggleLeadChanged(canToggle: boolean) {
		this.canToggleLead = canToggle;
	}

	onPostEdited(item: EventItem) {
		this.feedComponent.onPostEdited(item);
	}

	onPostPublished(item: EventItem) {
		this.feedComponent.onPostPublished(item);
	}

	onPostRemoved(item: EventItem) {
		this.feedComponent.onPostRemoved(item);
	}

	onPostFeatured(item: EventItem, community: Community) {
		this.feedComponent.onPostFeatured(item, community);
	}

	onPostUnfeatured(item: EventItem, community: Community) {
		this.feedComponent.onPostUnfeatured(item, community);
	}

	onPostMovedChannel(item: EventItem, movedTo: CommunityChannel) {
		this.feedComponent.onPostMovedChannel(item, movedTo);
	}

	onPostRejected(item: EventItem, community: Community) {
		this.feedComponent.onPostRejected(item, community);
	}

	onPostPinned(item: EventItem) {
		this.feedComponent.onPostPinned(item);
	}

	onPostUnpinned(item: EventItem) {
		this.feedComponent.onPostUnpinned(item);
	}

	onPostStickersVisibilityChange(visible: boolean) {
		this.stickersVisible = visible;
		// Scroll to the sticker target to show stickers.
		if (visible) {
			Scroll.to(this.$refs.stickerTarget.$el as HTMLElement, { preventDirections: ['down'] });
		}
	}

	getChannelRoute(postCommunity: FiresidePostCommunity) {
		if (!postCommunity.channel) {
			return undefined;
		}

		return postCommunity.community.channelRouteLocation(postCommunity.channel);
	}

	getChannelTitle(postCommunity: FiresidePostCommunity) {
		return postCommunity.channel ? postCommunity.channel.title : '';
	}
}
