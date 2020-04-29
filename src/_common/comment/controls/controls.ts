import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { AppAuthRequired } from '../../auth/auth-required-directive';
import { fuzzynumber } from '../../filters/fuzzynumber';
import { LikersModal } from '../../likers/modal.service';
import { Model } from '../../model/model.service';
import { Screen } from '../../screen/screen-service';
import { handleNewStickerNotification } from '../../sticker/sticker.model';
import { AppTooltip } from '../../tooltip/tooltip';
import { Comment } from '../comment-model';
import { CommentThreadModal } from '../thread/modal.service';
import { CommentVote } from '../vote/vote-model';

@Component({
	directives: {
		AppAuthRequired,
		AppTooltip,
	},
	filters: {
		fuzzynumber,
	},
})
export default class AppCommentControls extends Vue {
	@Prop(Model)
	model!: Model;

	@Prop(Comment)
	comment!: Comment;

	@Prop(Array)
	children?: Comment[];

	@Prop(Boolean)
	showReply?: boolean;

	readonly Screen = Screen;

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

	async onUpvoteClick() {
		const payload = await this.voteComment(CommentVote.VOTE_UPVOTE);
		if (payload.success && payload.newSticker) {
			handleNewStickerNotification(
				this.$gettext(`You can unlock a new sticker!`),
				this.$gettext(`Click this message to unlock right away.`),
				this.$store
			);
		}
	}

	onDownvoteClick() {
		this.voteComment(CommentVote.VOTE_DOWNVOTE);
	}

	voteComment(vote: number) {
		if (!this.comment.user_vote || this.comment.user_vote.vote !== vote) {
			return this.comment.$vote(vote);
		} else {
			return this.comment.$removeVote();
		}
	}

	onReplyClick(autofocus: boolean) {
		CommentThreadModal.show({
			model: this.model,
			commentId: this.comment.id,
			displayMode: 'comments',
			autofocus,
		});
	}

	showLikers() {
		LikersModal.show({ count: this.comment.votes, resource: this.comment });
	}
}
