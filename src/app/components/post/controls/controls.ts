import { Emit, Inject, Options, Prop, Vue } from 'vue-property-decorator';
import {
	Analytics,
	PostControlsLocation,
	trackPostPublish,
} from '../../../../_common/analytics/analytics.service';
import { AppAuthRequired } from '../../../../_common/auth/auth-required-directive';
import {
	CommentStoreManager,
	CommentStoreManagerKey,
	CommentStoreModel,
	lockCommentStore,
	releaseCommentStore,
	setCommentCount,
} from '../../../../_common/comment/comment-store';
import { CommentModal } from '../../../../_common/comment/modal/modal.service';
import { CommunityChannel } from '../../../../_common/community/channel/channel.model';
import { Community } from '../../../../_common/community/community.model';
import {
	DrawerStore,
	DrawerStoreKey,
	setDrawerOpen,
} from '../../../../_common/drawer/drawer-store';
import { fuzzynumber } from '../../../../_common/filters/fuzzynumber';
import { number } from '../../../../_common/filters/number';
import AppFiresidePostLikeWidget from '../../../../_common/fireside/post/like/widget/widget.vue';
import { FiresidePost } from '../../../../_common/fireside/post/post-model';
import { Screen } from '../../../../_common/screen/screen-service';
import AppStickerControlsOverlay from '../../../../_common/sticker/controls-overlay/controls-overlay.vue';
import { AppState, AppStore } from '../../../../_common/store/app-store';
import { AppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import { UserFollowSuggestion } from '../../../../_common/user/follow/suggestion.service';
import { User } from '../../../../_common/user/user.model';
import { ActivityFeedItem } from '../../activity/feed/item-service';
import { ActivityFeedView } from '../../activity/feed/view';
import { AppCommentWidgetLazy } from '../../lazy';
import { PostEditModal } from '../edit-modal/edit-modal-service';
import AppPostControlsMore from './more/more.vue';
import AppPostControlsSaveProgress from './save-progress/save-progress.vue';
import AppPostControlsStats from './stats/stats.vue';
import AppPostControlsUserFollow from './user-follow/user-follow.vue';

@Options({
	components: {
		AppPostControlsUserFollow,
		AppPostControlsMore,
		AppPostControlsStats,
		AppPostControlsSaveProgress,
		AppStickerControlsOverlay,
		AppCommentWidget: AppCommentWidgetLazy,
		AppFiresidePostLikeWidget,
	},
	directives: {
		AppTooltip,
		AppAuthRequired,
	},
})
export default class AppPostControls extends Vue {
	@Prop({ type: FiresidePost, required: true })
	post!: FiresidePost;

	@Prop({ type: ActivityFeedView, required: false })
	feed?: ActivityFeedView;

	@Prop({ type: ActivityFeedItem, required: false })
	item?: ActivityFeedItem;

	@Prop({ type: String, required: true })
	location!: PostControlsLocation;

	@Prop({ type: Boolean, required: false, default: false })
	shouldShowFollow!: boolean;

	@Prop({ type: Boolean, required: false, default: false })
	showComments!: boolean;

	@Prop({ type: String, required: false, default: '' })
	eventLabel!: string;

	@Inject({ from: CommentStoreManagerKey })
	commentManager!: CommentStoreManager;

	@Inject({ from: DrawerStoreKey })
	drawerStore!: DrawerStore;

	@AppState user!: AppStore['user'];

	shouldShowFollowState = false;
	private commentStore: null | CommentStoreModel = null;

	readonly GJ_IS_CLIENT!: boolean;
	readonly Screen = Screen;
	readonly fuzzynumber = fuzzynumber;
	readonly number = number;

	@Emit('post-edit') emitPostEdit() {}
	@Emit('post-publish') emitPostPublish() {}
	@Emit('post-remove') emitPostRemove() {}
	@Emit('post-feature') emitPostFeature(_community: Community) {}
	@Emit('post-unfeature') emitPostUnfeature(_community: Community) {}
	@Emit('post-move-channel') emitPostMoveChannel(_movedTo: CommunityChannel) {}
	@Emit('post-reject') emitPostReject(_community: Community) {}
	@Emit('post-pin') emitPostPin() {}
	@Emit('post-unpin') emitPostUnpin() {}
	@Emit('sticker') emitSticker() {}

	get hasActivePost() {
		return this.post && this.post.status === FiresidePost.STATUS_ACTIVE;
	}

	get isShowingFollow() {
		if (!this.shouldShowFollow || !this.shouldShowFollowState || !this.post) {
			return false;
		}

		if ((this.user && this.user.id === this.post.user.id) || this.post.user.is_following) {
			return false;
		}

		return true;
	}

	get commentsCount() {
		return this.commentStore ? this.commentStore.totalCount : 0;
	}

	get canPublish() {
		return (
			this.post.isDraft &&
			!this.post.isScheduled &&
			this.post.hasLead &&
			this.post.canPublishToCommunities()
		);
	}

	get showUserControls() {
		return this.post.isActive && !this.post.is_processing;
	}

	get hasPerms() {
		if (!this.user) {
			return false;
		}
		return this.post.isEditableByUser(this.user);
	}

	get shouldShowEdit() {
		return this.hasPerms;
	}

	get shouldShowExtra() {
		return this.user instanceof User;
	}

	get shouldShowCommentsButton() {
		return this.showComments;
	}

	get shouldShowStickersButton() {
		return this.post.canPlaceSticker;
	}

	get shouldShowStatsInNewLine() {
		return Screen.isXs;
	}

	get shouldShowLike() {
		return this.post.canLike;
	}

	created() {
		// The 'feed' and 'item' props will be included when this is used in the
		// activity feed. If that's the case, we need to make sure we synchronize with
		// the activity feed item state so that if they click away from the feed and
		// back to it, it can initialize with the previous state.
		if (this.item && this.feed) {
			this.shouldShowFollowState = this.feed.isItemShowingFollow(this.item);
		}

		this.commentStore = lockCommentStore(this.commentManager, 'Fireside_Post', this.post.id);
		setCommentCount(this.commentStore, this.post.comment_count);
	}

	unmounted() {
		if (this.commentStore) {
			releaseCommentStore(this.commentManager, this.commentStore);
			this.commentStore = null;
		}
	}

	openComments() {
		Analytics.trackEvent('post-controls', 'comments', this.eventLabel);
		CommentModal.show({
			model: this.post,
			displayMode: 'comments',
		});
	}

	async openEdit() {
		Analytics.trackEvent('post-controls', 'edit', this.eventLabel);
		if (await PostEditModal.show(this.post)) {
			this.emitPostEdit();
		}
	}

	async publish() {
		trackPostPublish();
		await this.post.$publish();
		this.emitPostPublish();
	}

	async placeSticker() {
		Analytics.trackEvent('post-controls', 'sticker-place', this.eventLabel);
		setDrawerOpen(this.drawerStore, true);
		this.emitSticker();
	}

	setUserFollow(showing: boolean) {
		if (showing && this.post) {
			// Do nothing if a post is liked and we recently suggested
			// to follow that user - so we don't spam them.
			if (!UserFollowSuggestion.canSuggest(this.post.user.id)) {
				return;
			}

			// Track analytics for how many people see user-follow,
			// and stop suggesting to follow the user for 'X' amount
			// of time - specified in UserFollowSuggestion.
			Analytics.trackEvent('user-follow', 'show', 'fireside-post-like-widget');
			UserFollowSuggestion.doNotSuggest(this.post.user.id);
		}

		this.shouldShowFollowState = showing;

		// If we're part of the activity feed, synchronize it with that state as well.
		if (this.item && this.feed) {
			this.feed.setItemShowingFollow(this.item, showing);
		}
	}

	onUserFollowDismissal() {
		// Track analytics for how often people click
		// on the 'X' button to hide user-follow.
		Analytics.trackEvent('user-follow', 'hide', 'fireside-post-like-widget');
		this.setUserFollow(false);
	}
}
