import { CommentVideoModal } from 'game-jolt-frontend-lib/components/comment/video/modal/modal.service';
import { CommentVideo } from 'game-jolt-frontend-lib/components/comment/video/video-model';
import { Community } from 'game-jolt-frontend-lib/components/community/community.model';
import AppCommunityPill from 'game-jolt-frontend-lib/components/community/pill/pill.vue';
import AppContentViewer from 'game-jolt-frontend-lib/components/content/content-viewer/content-viewer.vue';
import { Environment } from 'game-jolt-frontend-lib/components/environment/environment.service';
import { EventItem } from 'game-jolt-frontend-lib/components/event-item/event-item.model';
import AppFadeCollapse from 'game-jolt-frontend-lib/components/fade-collapse/fade-collapse.vue';
import { FiresidePost } from 'game-jolt-frontend-lib/components/fireside/post/post-model';
import { Game } from 'game-jolt-frontend-lib/components/game/game.model';
import { Navigate } from 'game-jolt-frontend-lib/components/navigate/navigate.service';
import { Screen } from 'game-jolt-frontend-lib/components/screen/screen-service';
import AppUserCardHover from 'game-jolt-frontend-lib/components/user/card/hover/hover.vue';
import AppUserFollowWidget from 'game-jolt-frontend-lib/components/user/follow-widget/follow-widget.vue';
import AppUserAvatar from 'game-jolt-frontend-lib/components/user/user-avatar/user-avatar.vue';
import { findRequiredVueParent } from 'game-jolt-frontend-lib/utils/vue';
import { number } from 'game-jolt-frontend-lib/vue/filters/number';
import Vue from 'vue';
import { Component, Inject, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { Store } from '../../../../store';
import AppEventItemControls from '../../../event-item/controls/controls.vue';
import AppFiresidePostManage from '../../../fireside/post/manage/manage.vue';
import AppPollVoting from '../../../poll/voting/voting.vue';
import AppActivityFeedCommentVideo from '../comment-video/comment-video.vue';
import AppActivityFeedDevlogPostMedia from '../devlog-post/media/media.vue';
import AppActivityFeedDevlogPostSketchfab from '../devlog-post/sketchfab/sketchfab.vue';
import AppActivityFeedDevlogPostText from '../devlog-post/text/text.vue';
import AppActivityFeedDevlogPostVideo from '../devlog-post/video/video.vue';
import AppActivityFeedTS from '../feed';
import AppActivityFeed from '../feed.vue';
import { ActivityFeedItem } from '../item-service';
import { ActivityFeedView } from '../view';
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
		AppFiresidePostManage,
		AppEventItemControls,
		AppPollVoting,
		AppUserCardHover,
		AppFadeCollapse,
		AppCommunityPill,
		AppContentViewer,
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

	private resizeSensor?: any;
	private feedComponent!: AppActivityFeedTS;

	readonly Screen = Screen;
	readonly EventItem = EventItem;

	$el!: HTMLDivElement;

	get isNew() {
		return this.feed.isItemUnread(this.item);
	}

	get isThreadView() {
		return !Screen.isXs;
	}

	get eventItem() {
		return this.item.feedItem as EventItem;
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

	get user() {
		if (this.eventItem.type === EventItem.TYPE_COMMENT_VIDEO_ADD) {
			return (this.eventItem.action as CommentVideo).comment.user;
		} else if (this.eventItem.type === EventItem.TYPE_GAME_PUBLISH) {
			return (this.eventItem.action as Game).developer;
		} else if (this.eventItem.type === EventItem.TYPE_POST_ADD) {
			const post = this.eventItem.action as FiresidePost;
			if (post.game && post.as_game_owner) {
				return post.game.developer;
			}

			return post.user;
		}

		return undefined;
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
		// Don't show follow for game posts. Only for user posts/videos.
		return (
			this.feed.shouldShowFollow &&
			!(this.post && this.post.game) &&
			this.user &&
			!this.user.is_following
		);
	}

	get shouldShowManage() {
		return this.post && this.post.isManageableByUser(this.app.user);
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

	onPostRejected(item: EventItem, community: Community) {
		this.feedComponent.onPostRejected(item, community);
	}
}
