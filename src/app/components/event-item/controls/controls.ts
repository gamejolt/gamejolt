import Vue from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { Store } from '../../../../auth/store/index';
import { propOptional } from '../../../../utils/vue';
import { Analytics } from '../../../../_common/analytics/analytics.service';
import AppCommentVideoLikeWidget from '../../../../_common/comment/video/like-widget/like-widget.vue';
import { CommentVideo } from '../../../../_common/comment/video/video-model';
import { CommunityChannel } from '../../../../_common/community/channel/channel.model';
import { Community } from '../../../../_common/community/community.model';
import AppEventItemControlsOverlay from '../../../../_common/event-item/controls-overlay/controls-overlay.vue';
import { FiresidePost } from '../../../../_common/fireside/post/post-model';
import { UserFollowSuggestion } from '../../../../_common/user/follow/suggestion.service';
import { ActivityFeedItem } from '../../activity/feed/item-service';
import { ActivityFeedView } from '../../activity/feed/view';
import AppEventItemControlsComments from './comments/comments.vue';
import AppEventItemControlsFiresidePost from './fireside-post/fireside-post.vue';
import AppEventItemControlsUserFollow from './user-follow/user-follow.vue';

@Component({
	components: {
		AppCommentVideoLikeWidget,
		AppEventItemControlsFiresidePost,
		AppEventItemControlsComments,
		AppEventItemControlsUserFollow,
		AppEventItemControlsOverlay,
	},
})
export default class AppEventItemControls extends Vue {
	@Prop(FiresidePost)
	post?: FiresidePost;

	@Prop(CommentVideo)
	video?: CommentVideo;

	@Prop(ActivityFeedView)
	feed?: ActivityFeedView;

	@Prop(ActivityFeedItem)
	item?: ActivityFeedItem;

	@Prop(Boolean)
	shouldShowFollow?: boolean;

	@Prop(Boolean)
	showComments?: boolean;

	@Prop(propOptional(Boolean, false)) showStickers!: boolean;

	@State
	app!: Store['app'];

	commentsCount = 0;
	shouldShowFollowState = false;

	@Emit('post-edit')
	emitPostEdit() {}

	@Emit('post-publish')
	emitPostPublish() {}

	@Emit('post-remove')
	emitPostRemove() {}

	@Emit('post-feature')
	emitPostFeature(_community: Community) {}

	@Emit('post-unfeature')
	emitPostUnfeature(_community: Community) {}

	@Emit('post-move-channel')
	emitPostMoveChannel(_movedTo: CommunityChannel) {}

	@Emit('post-reject')
	emitPostReject(_community: Community) {}

	@Emit('post-pin')
	emitPostPin() {}

	@Emit('post-unpin')
	emitPostUnpin() {}

	emitStickersVisibilityChange(visible: boolean) {
		this.$emit('post-stickers-visibility-change', visible);
	}

	created() {
		// The 'feed' and 'item' props will be included when this is used in the
		// activity feed. If that's the case, we need to make sure we synchronize with
		// the activity feed item state so that if they click away from the feed and
		// back to it, it can initialize with the previous state.
		if (this.item && this.feed) {
			this.shouldShowFollowState = this.feed.isItemShowingFollow(this.item);
		}
	}

	get hasActivePost() {
		return this.post && this.post.status === FiresidePost.STATUS_ACTIVE;
	}

	get showCommentFeed() {
		return !!this.showComments;
	}

	get isShowingFollow() {
		if (!this.shouldShowFollow || !this.shouldShowFollowState || !this.post) {
			return false;
		}

		if (
			(this.app.user && this.app.user.id === this.post.user.id) ||
			this.post.user.is_following
		) {
			return false;
		}

		return true;
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
