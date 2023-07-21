<script lang="ts" setup>
import { computed, PropType, toRefs } from 'vue';
import { useRouter } from 'vue-router';
import { vAppAuthRequired } from '../../auth/auth-required-directive';
import AppButton from '../../button/AppButton.vue';
import { formatFuzzynumber } from '../../filters/fuzzynumber';
import AppJolticon, { Jolticon } from '../../jolticon/AppJolticon.vue';
import { LikersModal } from '../../likers/modal.service';
import { Model } from '../../model/model.service';
import { selectReactionForResource } from '../../reaction/reaction-count';
import { Screen } from '../../screen/screen-service';
import { useCommonStore } from '../../store/common-store';
import { kThemeBg, kThemeBgOffset } from '../../theme/variables';
import { vAppTooltip } from '../../tooltip/tooltip-directive';
import AppTranslate from '../../translate/AppTranslate.vue';
import { $gettext, $gettextInterpolate, $ngettext } from '../../translate/translate.service';
import AppUserAvatarImg from '../../user/user-avatar/AppUserAvatarImg.vue';
import { addCommentVote, Comment, removeCommentVote } from '../comment-model';
import { CommentThreadModal } from '../thread/modal.service';
import { CommentVoteType } from '../vote/vote-model';
import { useCommentWidget } from '../widget/AppCommentWidget.vue';

const props = defineProps({
	model: {
		type: Object as PropType<Model>,
		required: true,
	},
	comment: {
		type: Object as PropType<Comment>,
		required: true,
	},
	children: {
		type: Array as PropType<Comment[]>,
		default: () => [],
	},
	showReply: {
		type: Boolean,
	},
	canReply: {
		type: Boolean,
	},
	canVote: {
		type: Boolean,
	},
	canReact: {
		type: Boolean,
	},
});

const { model, comment, children, showReply, canReply, canReact } = toRefs(props);

const router = useRouter();
const { resourceOwner } = useCommentWidget()!;
const { user } = useCommonStore();

const votingTooltip = computed(() => {
	const userHasVoted = !!comment.value.user_vote;
	const count = comment.value.votes;

	if (count <= 0) {
		return $gettext('Give this comment some love!');
	} else if (userHasVoted) {
		if (count === 1) {
			return $gettext('You like this comment');
		} else {
			return $gettextInterpolate(
				$ngettext(
					'You and another person like this comment',
					'You and %{ count } people like this comment',
					count - 1
				),
				{ count: count - 1 }
			);
		}
	} else {
		return $gettextInterpolate(
			$ngettext(
				'One person likes this comment',
				'%{ count } people like this comment',
				count
			),
			{ count }
		);
	}
});

const hasUpvote = computed(
	() => comment.value.user_vote && comment.value.user_vote.vote === CommentVoteType.Upvote
);

const hasDownvote = computed(
	() => comment.value.user_vote && comment.value.user_vote.vote === CommentVoteType.Downvote
);

const showOwnerInteraction = computed(
	() => comment.value.has_owner_like || comment.value.has_owner_reply
);

const ownerIndicatorTooltipText = computed(() => {
	const isOwner = !!user.value?.id && user.value?.id === resourceOwner.value?.id;
	const resourceOwnerUsername = resourceOwner.value
		? '@' + resourceOwner.value.username
		: 'The owner';

	if (comment.value.has_owner_like && comment.value.has_owner_reply) {
		return isOwner
			? $gettext(`You liked this and replied`)
			: $gettextInterpolate(`%{ username } liked this and replied`, {
					username: resourceOwnerUsername,
			  });
	} else if (comment.value.has_owner_like) {
		return isOwner
			? $gettext(`You liked this`)
			: $gettextInterpolate(`%{ username } liked this`, {
					username: resourceOwnerUsername,
			  });
	} else if (comment.value.has_owner_reply) {
		return isOwner
			? $gettext(`You replied to this`)
			: $gettextInterpolate(`%{ username } replied`, {
					username: resourceOwnerUsername,
			  });
	}
});

const ownerIndicatorIcons = computed(() => {
	const icons: Jolticon[] = [];

	if (comment.value.has_owner_like) {
		icons.push('heart-filled');
	}

	if (comment.value.has_owner_reply) {
		icons.push('comment-filled');
	}

	return icons;
});

function onUpvoteClick() {
	voteComment(CommentVoteType.Upvote);
}

function onDownvoteClick() {
	voteComment(CommentVoteType.Downvote);
}

async function voteComment(vote: number) {
	let result: any | null = null;
	if (!comment.value.user_vote || comment.value.user_vote.vote !== vote) {
		result = await addCommentVote(comment.value, vote);
	} else {
		result = await removeCommentVote(comment.value);
	}

	if (result && result.comment) {
		const resultComment = new Comment(result.comment);
		comment.value.has_owner_like = resultComment.has_owner_like;
	}
}

function onReplyClick(autofocus: boolean) {
	CommentThreadModal.show({
		router: router,
		model: model.value,
		commentId: comment.value.id,
		displayMode: 'comments',
		autofocus,
	});
}

function showLikers() {
	LikersModal.show({ count: comment.value.votes, resource: comment.value });
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
				:disabled="!canVote"
				:primary="canVote && hasUpvote"
				:solid="hasUpvote"
				@click="onUpvoteClick()"
			/>

			<a
				v-if="comment.votes > 0"
				v-app-tooltip="$gettext(`View all people that liked this comment`)"
				class="blip"
				:class="{
					'blip-active': canVote && hasUpvote,
					mobile: Screen.isXs,
				}"
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
				:disabled="!canVote"
				:primary="canVote && hasDownvote"
				:solid="hasDownvote"
				@click="onDownvoteClick()"
			/>

			<AppButton
				v-if="canReact"
				v-app-tooltip="$gettext('Add reaction')"
				v-app-track-event="`comment-widget:add-reaction`"
				v-app-auth-required
				class="-control-margin"
				icon="add-reaction"
				circle
				trans
				@click="selectReactionForResource(comment)"
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

		<!-- Owner interaction indicator -->
		<span
			v-if="showOwnerInteraction && resourceOwner"
			v-app-tooltip="ownerIndicatorTooltipText"
			:style="{
				marginLeft: `16px`,
				position: `relative`,
				zIndex: 1,
			}"
		>
			<AppUserAvatarImg
				:user="resourceOwner"
				:style="{
					position: `relative`,
					zIndex: 1,
					width: `24px`,
					height: `24px`,
					display: `inline-block`,
					marginTop: `-8px`,
					paddingTop: `8px`,
				}"
				class="_owner-reply-avatar _owner-reply-avatar-with-reply"
				:class="{ '_owner-reply-avatar-with-reply': comment.has_owner_reply }"
			/>

			<!-- The vertical track that we put the indicators in. -->
			<span
				:style="{
					position: `absolute`,
					zIndex: 2,
					display: `flex`,
					flexDirection: `column`,
					justifyContent: `center`,
					bottom: `-10px`,
					right: `-16px`,
					gap: `2px`,
				}"
			>
				<span
					v-for="icon of ownerIndicatorIcons"
					:key="icon"
					:style="{
						display: `flex`,
						alignItems: `center`,
						justifyContent: `center`,
						width: `18px`,
						height: `18px`,
						backgroundColor: kThemeBgOffset,
						border: `2px solid ${kThemeBg}`,
						borderRadius: `50%`,
					}"
				>
					<AppJolticon notice :icon="icon" :style="{ fontSize: `10px` }" />
				</span>
			</span>
		</span>
	</span>
</template>

<style lang="stylus" scoped>
.-control-margin
	margin-left: 8px

.-replies
	display: inline-flex
	align-items: center

	@media $media-xs
		margin-top: 8px
		margin-left: -6px

._owner-reply-avatar
	&::after
		content: ''
		position: absolute
		z-index: -1
		top: 4px
		left: -4px
		width: 32px
		height: 32px
		background-color: var(--theme-bg-offset)
		rounded-corners-lg()

	&::before
		content: ''
		position: absolute
		z-index: -1
		top: 12px
		left: -11px
		width: 0
		height: 0
		border-top: 8px solid transparent
		border-bottom: 8px solid transparent
		border-right: 8px solid var(--theme-bg-offset)
</style>
