import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { AppTooltip } from '../../../../components/tooltip/tooltip';
import { number } from '../../../../vue/filters/number';
import { AppAuthRequired } from '../../../auth/auth-required-directive';
import { LikersModal } from '../../../likers/modal.service';
import { CommentVote } from '../../vote/vote-model';
import { CommentVideo } from '../video-model';

@Component({
	directives: {
		AppAuthRequired,
		AppTooltip,
	},
})
export default class AppCommentVideoLikeWidget extends Vue {
	@Prop(CommentVideo)
	video!: CommentVideo;

	@Prop(Boolean)
	overlay?: boolean;

	@Prop(Boolean)
	trans?: boolean;

	@Prop(Boolean)
	block?: boolean;

	isProcessing = false;

	get comment() {
		return this.video.comment;
	}

	get blip() {
		return this.comment.votes ? number(this.comment.votes) : '';
	}

	async toggle() {
		this.isProcessing = true;

		if (!this.comment.user_vote || this.comment.user_vote.vote === CommentVote.VOTE_DOWNVOTE) {
			await this.comment.$vote(CommentVote.VOTE_UPVOTE);
		} else {
			await this.comment.$removeVote();
		}

		this.isProcessing = false;
	}

	showLikers() {
		LikersModal.show({ count: this.comment.votes, resource: this.comment });
	}
}
