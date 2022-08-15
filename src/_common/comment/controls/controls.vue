<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import { shallowSetup } from '../../../utils/vue';
import { Analytics } from '../../analytics/analytics.service';
import { vAppAuthRequired } from '../../auth/auth-required-directive';
import { setDrawerOpen, useDrawerStore } from '../../drawer/drawer-store';
import { formatFuzzynumber } from '../../filters/fuzzynumber';
import { LikersModal } from '../../likers/modal.service';
import { Model } from '../../model/model.service';
import { Screen } from '../../screen/screen-service';
import { vAppTooltip } from '../../tooltip/tooltip-directive';
import { addCommentVote, canCommentOnModel, Comment, removeCommentVote } from '../comment-model';
import { CommentThreadModal } from '../thread/modal.service';
import { CommentVote } from '../vote/vote-model';

@Options({
	directives: {
		AppAuthRequired: vAppAuthRequired,
		AppTooltip: vAppTooltip,
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

	drawer = shallowSetup(() => useDrawerStore());

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
			router: this.$router,
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
</script>

<template>
	<span class="comment-controls">
		<span v-app-auth-required>
			<AppButton
				v-app-tooltip="votingTooltip"
				v-app-track-event="`comment-widget:vote-click`"
				icon="thumbs-up"
				circle
				trans
				:primary="hasUpvote"
				:solid="hasUpvote"
				@click="onUpvoteClick()"
			/>

			<a
				v-if="comment.votes > 0"
				v-app-tooltip="$gettext(`View all people that liked this comment`)"
				class="blip"
				:class="{ 'blip-active': comment.user_vote, mobile: Screen.isXs }"
				@click="showLikers()"
			>
				{{ formatFuzzynumber(comment.votes) }}
			</a>
			<span v-else class="blip-missing" />

			<AppButton
				v-app-track-event="`comment-widget:vote-click`"
				icon="thumbs-down"
				circle
				trans
				:primary="hasDownvote"
				:solid="hasDownvote"
				@click="onDownvoteClick()"
			/>

			<AppButton
				v-if="canPlaceStickers"
				v-app-tooltip="$gettext('Place Sticker')"
				v-app-track-event="`comment-widget:place-sticker`"
				v-app-auth-required
				class="-control-margin"
				icon="sticker"
				circle
				trans
				@click="placeSticker()"
			/>
		</span>

		<template v-if="showReply">
			<span v-if="canReply" v-app-auth-required>
				<AppButton
					v-app-tooltip="$gettext(`Reply`)"
					v-app-track-event="`comment-widget:reply-click`"
					class="-control-margin"
					icon="reply"
					circle
					trans
					@click="onReplyClick(true)"
				/>
			</span>
			<AppButton v-if="children.length" class="-replies" trans @click="onReplyClick(false)">
				<AppTranslate
					:translate-n="children.length"
					:translate-params="{ count: children.length }"
					translate-plural="+ %{ count } replies"
				>
					+ %{ count } reply
				</AppTranslate>
			</AppButton>
		</template>
	</span>
</template>

<style lang="stylus" scoped>
.-control-margin
	margin-left: 8px

.-replies
	@media $media-xs
		margin-top: 8px
		margin-left: -6px
		display: block
</style>
