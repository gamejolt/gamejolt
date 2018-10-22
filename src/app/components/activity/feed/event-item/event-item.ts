import View from '!view!./event-item.html?style=./event-item.styl';
import { Environment } from 'game-jolt-frontend-lib/components/environment/environment.service';
import { AppFadeCollapse } from 'game-jolt-frontend-lib/components/fade-collapse/fade-collapse';
import { Navigate } from 'game-jolt-frontend-lib/components/navigate/navigate.service';
import { AppUserAvatar } from 'game-jolt-frontend-lib/components/user/user-avatar/user-avatar';
import { findRequiredVueParent } from 'game-jolt-frontend-lib/utils/vue';
import Vue from 'vue';
import { Component, Inject, Prop } from 'vue-property-decorator';
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
import { AppUserCardHover } from '../../../../../lib/gj-lib-client/components/user/card/hover/hover';
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
import { ActivityFeedView } from '../view';
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
		AppUserCardHover,
		AppFadeCollapse,
	},
	filters: {
		number,
	},
})
export class AppActivityFeedEventItem extends Vue {
	@Inject()
	feed!: ActivityFeedView;

	@Prop(ActivityFeedItem)
	item!: ActivityFeedItem;

	@State
	app!: Store['app'];

	canToggleLead = false;

	private resizeSensor?: any;
	private feedComponent!: AppActivityFeed;

	readonly Screen = Screen;
	readonly EventItem = EventItem;

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
			// TODO(userposts)
			const post = this.post!;
			if (this.game) {
				return {
					name: 'discover.games.view.devlog.view',
					params: {
						slug: this.game.slug,
						id: this.game.id + '',
						postSlug: post.slug,
					},
				};
			} else {
				return {
					name: 'profile.post.view',
					params: {
						username: post.user.username,
						slug: post.slug,
					},
				};
			}
		}

		return null;
	}

	get linkResolved() {
		if (!this.link) {
			return '';
		}
		return this.$router.resolve(this.link).href;
	}

	get shouldShowManage() {
		return this.post && canUserManagePost(this.post, this.app.user);
	}

	mounted() {
		this.feedComponent = findRequiredVueParent(this, AppActivityFeed);
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
}
