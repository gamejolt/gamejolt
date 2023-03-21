<script lang="ts" setup>
import { computed, PropType, toRefs } from 'vue';
import { useRouter } from 'vue-router';
import { vAppAuthRequired } from '../../auth/auth-required-directive';
import AppButton from '../../button/AppButton.vue';
import { formatFuzzynumber } from '../../filters/fuzzynumber';
import { LikersModal } from '../../likers/modal.service';
import { Model } from '../../model/model.service';
import { Screen } from '../../screen/screen-service';
import { useStickerLayer } from '../../sticker/layer/layer-controller';
import { openStickerDrawer, useStickerStore } from '../../sticker/sticker-store';
import { vAppTooltip } from '../../tooltip/tooltip-directive';
import AppTranslate from '../../translate/AppTranslate.vue';
import { $gettext, $gettextInterpolate, $ngettext } from '../../translate/translate.service';
import { addCommentVote, Comment, removeCommentVote } from '../comment-model';
import { CommentThreadModal } from '../thread/modal.service';
import { CommentVote } from '../vote/vote-model';

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
	canPlaceStickers: {
		type: Boolean,
	},
});

const { model, comment, children, showReply, canReply, canPlaceStickers } = toRefs(props);

const stickerStore = useStickerStore();
const stickerLayer = useStickerLayer();
const router = useRouter();

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
	() => comment.value.user_vote && comment.value.user_vote.vote === CommentVote.VOTE_UPVOTE
);

const hasDownvote = computed(
	() => comment.value.user_vote && comment.value.user_vote.vote === CommentVote.VOTE_DOWNVOTE
);

function onUpvoteClick() {
	voteComment(CommentVote.VOTE_UPVOTE);
}

function onDownvoteClick() {
	voteComment(CommentVote.VOTE_DOWNVOTE);
}

function voteComment(vote: number) {
	if (!comment.value.user_vote || comment.value.user_vote.vote !== vote) {
		return addCommentVote(comment.value, vote);
	} else {
		return removeCommentVote(comment.value);
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

async function placeSticker() {
	if (!canPlaceStickers.value || !stickerLayer) {
		return;
	}
	openStickerDrawer(stickerStore, stickerLayer);
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
				v-if="canPlaceStickers && stickerLayer"
				v-app-tooltip="$gettext('Place sticker')"
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
