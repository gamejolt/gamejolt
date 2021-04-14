import Vue from 'vue';
import { Component, Inject, Prop } from 'vue-property-decorator';
import { propOptional, propRequired } from '../../../utils/vue';
import { Analytics } from '../../analytics/analytics.service';
import { AppAuthRequired } from '../../auth/auth-required-directive';
import { DrawerStore, DrawerStoreKey, setDrawerOpen } from '../../drawer/drawer-store';
import { fuzzynumber } from '../../filters/fuzzynumber';
import { LikersModal } from '../../likers/modal.service';
import { Model } from '../../model/model.service';
import { Screen } from '../../screen/screen-service';
import { AppTooltip } from '../../tooltip/tooltip-directive';
import { canCommentOnModel, Comment } from '../comment-model';
import { CommentThreadModal } from '../thread/modal.service';
import { CommentVote } from '../vote/vote-model';

@Component({
	directives: {
		AppAuthRequired,
		AppTooltip,
	},
})
export default class AppCommentControls extends Vue {
	@Prop(propRequired(Model)) model!: Model;
	@Prop(propRequired(Comment)) comment!: Comment;
	@Prop(propOptional(Comment)) parent!: undefined | Comment;
	@Prop(propOptional(Array, () => [])) children!: Comment[];
	@Prop(propOptional(Boolean, false)) showReply!: boolean;
	@Prop(propOptional(Boolean, false)) canReply!: boolean;
	@Prop(propOptional(Boolean, false)) canPlaceStickers!: boolean;

	@Inject(DrawerStoreKey) drawer!: DrawerStore;

	readonly Screen = Screen;
	readonly fuzzynumber = fuzzynumber;

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
					{ count: count - 1 }
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

	get canComment() {
		return canCommentOnModel(this.model, this.parent);
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

	async placeSticker() {
		Analytics.trackEvent('post-controls', 'sticker-place', 'comments');
		setDrawerOpen(this.drawer, true);
	}
}
