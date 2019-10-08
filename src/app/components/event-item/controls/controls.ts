import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import AppCommentVideoLikeWidget from '../../../../_common/comment/video/like-widget/like-widget.vue';
import { CommentVideo } from '../../../../_common/comment/video/video-model';
import { FiresidePost } from '../../../../_common/fireside/post/post-model';
import { AppCommentWidgetLazy } from '../../lazy';
import AppEventItemControlsFiresidePost from './fireside-post/fireside-post.vue';

@Component({
	components: {
		AppCommentWidget: AppCommentWidgetLazy,
		AppCommentVideoLikeWidget,
		AppEventItemControlsFiresidePost,
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

	get hasActivePost() {
		return this.post && this.post.status === FiresidePost.STATUS_ACTIVE;
	}
}
