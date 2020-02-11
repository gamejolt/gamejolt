import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { CommentVideo } from '../../../../../../_common/comment/video/video-model';
import { FiresidePost } from '../../../../../../_common/fireside/post/post-model';
import { ActivityFeedService } from '../../feed-service';

@Component({})
export default class AppActivityFeedEventItemBlockOverlay extends Vue {
	@Prop(FiresidePost)
	post!: FiresidePost;
	@Prop(CommentVideo)
	video!: CommentVideo;

	private hasBypassed = false;

	get posterUsername() {
		if (this.post) {
			return this.post.user.username;
		}
		if (this.video) {
			return this.video.comment.user.username;
		}
	}

	get shouldBlock() {
		if (this.post) {
			return !this.hasBypassed && ActivityFeedService.shouldBlockPost(this.post, this.$route);
		}
		if (this.video) {
			return (
				!this.hasBypassed && ActivityFeedService.shouldBlockVideo(this.video, this.$route)
			);
		}
		return false;
	}

	unhide() {
		this.hasBypassed = true;
	}
}
