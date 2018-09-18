import View from '!view!./event-item.html?style=./event-item.styl';
import { Environment } from 'game-jolt-frontend-lib/components/environment/environment.service';
import { AppFadeCollapse } from 'game-jolt-frontend-lib/components/fade-collapse/fade-collapse';
import { Navigate } from 'game-jolt-frontend-lib/components/navigate/navigate.service';
import { AppUserAvatar } from 'game-jolt-frontend-lib/components/user/user-avatar/user-avatar';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { CommentVideoModal } from '../../../../../lib/gj-lib-client/components/comment/video/modal/modal.service';
import { CommentVideo } from '../../../../../lib/gj-lib-client/components/comment/video/video-model';
import { EventItem } from '../../../../../lib/gj-lib-client/components/event-item/event-item.model';
import {
	canUserManagePost,
	FiresidePost,
} from '../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { Game } from '../../../../../lib/gj-lib-client/components/game/game.model';
import { Screen } from '../../../../../lib/gj-lib-client/components/screen/screen-service';
import { findRequiredVueParent } from '../../../../../lib/gj-lib-client/utils/vue';
import { number } from '../../../../../lib/gj-lib-client/vue/filters/number';
import { Store } from '../../../../store';
import { AppEventItemControls } from '../../../event-item/controls/controls';
import { AppEventItemManage } from '../../../event-item/manage/manage';
import { AppPollVoting } from '../../../poll/voting/voting';
import { AppActivityFeedCommentVideo } from '../comment-video/comment-video';
import { AppActivityFeedDevlogPostMedia } from '../devlog-post/media/media';
import { AppActivityFeedDevlogPostSketchfab } from '../devlog-post/sketchfab/sketchfab';
import { AppActivityFeedDevlogPostText } from '../devlog-post/text/text';
import { AppActivityFeedDevlogPostVideo } from '../devlog-post/video/video';
import { AppActivityFeed } from '../feed';
import { ActivityFeedItem } from '../item-service';
import { AppActivityFeedEventItemTime } from './time/time';

const ResizeSensor = require('css-element-queries/src/ResizeSensor');

@View
@Component({
	components: {
		AppActivityFeedEventItemTime,
		AppUserAvatar,
		AppActivityFeedCommentVideo,
		AppActivityFeedDevlogPostText,
		AppActivityFeedDevlogPostMedia,
		AppActivityFeedDevlogPostSketchfab,
		AppActivityFeedDevlogPostVideo,
		AppEventItemManage,
		AppEventItemControls,
		AppPollVoting,
		AppFadeCollapse,
	},
	filters: {
		number,
	},
})
export class AppActivityFeedEventItem extends Vue {
	@Prop(ActivityFeedItem)
	item!: ActivityFeedItem;

	@Prop(Boolean)
	isNew?: boolean;

	@Prop(Boolean)
	isActive?: boolean;

	@Prop(Boolean)
	isHydrated?: boolean;

	@State
	app!: Store['app'];

	private resizeSensor?: any;

	feed!: AppActivityFeed;
	canToggleLead = false;

	readonly Screen = Screen;
	readonly EventItem = EventItem;

	get isThreadView() {
		return !Screen.isXs;
	}

	get eventItem() {
		return this.item.feedItem as EventItem;
	}

	get post() {
		if (this.eventItem.type === EventItem.TYPE_DEVLOG_POST_ADD) {
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

	get user() {
		if (this.eventItem.type === EventItem.TYPE_COMMENT_VIDEO_ADD) {
			return (this.eventItem.action as CommentVideo).comment.user;
		} else if (this.eventItem.type === EventItem.TYPE_GAME_PUBLISH) {
			return (this.eventItem.action as Game).developer;
		} else if (this.eventItem.type === EventItem.TYPE_DEVLOG_POST_ADD) {
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
			return '';
		} else if (this.eventItem.type === EventItem.TYPE_GAME_PUBLISH) {
			const game = this.game!;
			return {
				name: 'discover.games.view.overview',
				params: {
					slug: game.slug,
					id: game.id,
				},
			};
		} else if (this.eventItem.type === EventItem.TYPE_DEVLOG_POST_ADD) {
			const post = this.post!;
			const game = this.game!;
			return {
				name: 'discover.games.view.devlog.view',
				params: {
					slug: game.slug,
					id: game.id,
					postSlug: post.slug,
				},
			};
		}

		return '';
	}

	get shouldShowManage() {
		return this.post && canUserManagePost(this.post, this.app.user);
	}

	created() {
		this.feed = findRequiredVueParent(this, AppActivityFeed);
	}

	destroyed() {
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

		if (e.target) {
			const target = e.target as HTMLElement;
			const nodeName = target.nodeName.toLowerCase();
			if (ignoreList.indexOf(nodeName) !== -1) {
				return;
			}
		}

		if (e.metaKey || e.altKey) {
			return;
		}

		if (this.video) {
			CommentVideoModal.show(this.video);
		} else {
			if (e.ctrlKey || e.shiftKey) {
				Navigate.newWindow(Environment.wttfBaseUrl + this.$router.resolve(this.link).href);
				return;
			}

			this.$router.push(this.link);
		}
	}

	toggleLead() {
		this.item.isLeadOpen = !this.item.isLeadOpen;
		this.$emit('expanded');
	}

	canToggleLeadChanged(canToggle: boolean) {
		this.canToggleLead = canToggle;
	}
}
