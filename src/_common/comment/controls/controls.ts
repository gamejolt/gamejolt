import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { number } from '../../../vue/filters/number';
import { AppTrackEvent } from '../../analytics/track-event.directive';
import { AppAuthRequired } from '../../auth/auth-required-directive';
import { LikersModal } from '../../likers/modal.service';
import { AppTooltip } from '../../tooltip/tooltip';
import { Comment } from '../comment-model';
import { CommentThreadModal } from '../thread/modal.service';
import { CommentVote } from '../vote/vote-model';

@Component({
	directives: {
		AppAuthRequired,
		AppTooltip,
		AppTrackEvent,
	},
	filters: {
		number,
	},
})
export default class AppCommentControls extends Vue {
	@Prop(Comment)
	comment!: Comment;

	@Prop(Array)
	children?: Comment[];

	@Prop(Boolean)
	showReply?: boolean;

	get votingTooltip() {
		const userHasVoted = !!this.comment.user_vote;
		const count = this.comment.votes;

		if (count <= 0) {
			return this.$gettext('Give this comment some love!');
		} else if (userHasVoted) {
			if (count === 1) {
				return this.$gettext('You like this comment');
			} else {
				return this.$gettextInterpolate(
					this.$ngettext(
						'You and another person like this comment.',
						'You and %{ count } people like this comment.',
						count - 1
					),
					{ count }
				);
			}
		} else {
			return this.$gettextInterpolate(
				this.$ngettext(
					'One person likes this comment.',
					'%{ count } people like this comment.',
					count
				),
				{ count }
			);
		}
	}

	get hasUpvote() {
		return this.comment.user_vote && this.comment.user_vote.vote === CommentVote.VOTE_UPVOTE;
	}

	get hasDownvote() {
		return this.comment.user_vote && this.comment.user_vote.vote === CommentVote.VOTE_DOWNVOTE;
	}

	onUpvoteClick() {
		this.voteComment(CommentVote.VOTE_UPVOTE);
	}

	onDownvoteClick() {
		this.voteComment(CommentVote.VOTE_DOWNVOTE);
	}

	voteComment(vote: number) {
		if (!this.comment.user_vote || this.comment.user_vote.vote !== vote) {
			this.comment.$vote(vote);
		} else {
			this.comment.$removeVote();
		}
	}

	onReplyClick(autofocus: boolean) {
		CommentThreadModal.show({
			resource: this.comment.resource,
			resourceId: this.comment.resource_id,
			commentId: this.comment.id,
			displayMode: 'comments',
			autofocus,
		});
	}

	showLikers() {
		LikersModal.show({ count: this.comment.votes, resource: this.comment });
	}
}
