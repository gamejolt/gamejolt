import { Inject, Options, Prop, Vue } from 'vue-property-decorator';
import { Analytics } from '../../analytics/analytics.service';
import { AppAuthRequired } from '../../auth/auth-required-directive';
import { DrawerStore, DrawerStoreKey, setDrawerOpen } from '../../drawer/drawer-store';
import { formatFuzzynumber } from '../../filters/fuzzynumber';
import { LikersModal } from '../../likers/modal.service';
import { Model } from '../../model/model.service';
import { Screen } from '../../screen/screen-service';
import { AppTooltip } from '../../tooltip/tooltip-directive';
import { addCommentVote, canCommentOnModel, Comment, removeCommentVote } from '../comment-model';
import { CommentThreadModal } from '../thread/modal.service';
import { CommentVote } from '../vote/vote-model';

@Options({
	directives: {
		AppAuthRequired,
		AppTooltip,
	},
})
export default class AppCommentControls extends Vue {
	@Prop({ type: Object, required: true }) model!: Model;
	@Prop({ type: Object, required: true }) comment!: Comment;
	@Prop({ type: Object, default: undefined }) parent?: Comment;
	@Prop({ type: Array, default: () => [] }) children!: Comment[];
	@Prop({ type: Boolean, default: false }) showReply!: boolean;
	@Prop({ type: Boolean, default: false }) canReply!: boolean;
	@Prop({ type: Boolean, default: false }) canPlaceStickers!: boolean;

	@Inject({ from: DrawerStoreKey })
	drawer!: DrawerStore;

	readonly Screen = Screen;
	readonly formatFuzzynumber = formatFuzzynumber;

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
			return addCommentVote(this.comment, vote);
		} else {
			return removeCommentVote(this.comment);
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
