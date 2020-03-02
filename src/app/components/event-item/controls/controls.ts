import Vue from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';
import AppCommentVideoLikeWidget from '../../../../_common/comment/video/like-widget/like-widget.vue';
import { CommentVideo } from '../../../../_common/comment/video/video-model';
import { CommunityChannel } from '../../../../_common/community/channel/channel.model';
import { Community } from '../../../../_common/community/community.model';
import AppExpand from '../../../../_common/expand/expand.vue';
import { FiresidePost } from '../../../../_common/fireside/post/post-model';
import AppEventItemControlsComments from './comments/comments.vue';
import AppEventItemControlsFiresidePost from './fireside-post/fireside-post.vue';
import AppEventItemControlsUserFollow from './user-follow/user-follow.vue';

@Component({
	components: {
		AppCommentVideoLikeWidget,
		AppEventItemControlsFiresidePost,
		AppEventItemControlsComments,
		AppEventItemControlsUserFollow,
		AppExpand,
	},
})
export default class AppEventItemControls extends Vue {
	@Prop(FiresidePost)
	post?: FiresidePost;

	@Prop(Boolean)
	showUserFollow?: boolean;

	@Prop(CommentVideo)
	video?: CommentVideo;

	@Prop(Boolean)
	showComments?: boolean;

	commentsCount = 0;
	toggleUserFollow = false;

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
	emitPostReject() {}

	@Emit('post-pin')
	emitPostPin() {}

	@Emit('post-unpin')
	emitPostUnpin() {}

	get hasActivePost() {
		return this.post && this.post.status === FiresidePost.STATUS_ACTIVE;
	}

	get showCommentFeed() {
		return !!this.showComments;
	}
}
