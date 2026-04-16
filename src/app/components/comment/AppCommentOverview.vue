<script lang="ts" setup>
import { computed, watch } from 'vue';
import { useRouter } from 'vue-router';

import { DisplayMode } from '~app/components/comment/modal/modal.service';
import { showCommentThreadModal } from '~app/components/comment/thread/modal.service';
import AppFadeCollapse from '~common/AppFadeCollapse.vue';
import {
	CommentModel,
	getCommentBlockReason,
	getCommentModelResourceName,
} from '~common/comment/comment-model';
import {
	CommentStoreModel,
	getCommentStore,
	useCommentStoreManager,
} from '~common/comment/comment-store';
import AppContentViewer from '~common/content/content-viewer/AppContentViewer.vue';
import AppIllustration from '~common/illustration/AppIllustration.vue';
import { illNoCommentsSmall } from '~common/illustration/illustrations';
import { Model } from '~common/model/model.service';
import AppUserCardHover from '~common/user/card/AppUserCardHover.vue';
import AppUserAvatarBubble from '~common/user/user-avatar/AppUserAvatarBubble.vue';

type Props = {
	comments: CommentModel[];
	model: Model;
	displayMode: DisplayMode;
};
const { comments, model, displayMode } = defineProps<Props>();

const emit = defineEmits<{
	'reload-comments': [];
}>();

const commentManager = useCommentStoreManager()!;
const router = useRouter();

const displayComments = computed(() => {
	return comments.filter(c => getCommentBlockReason(c) === false);
});

const hasComments = computed(() => {
	const store = getCommentStore(
		commentManager,
		getCommentModelResourceName(model),
		model.id
	);
	if (store instanceof CommentStoreModel) {
		return store.totalCount > 0;
	}
	// If we didn't get the store information yet, treat this as if it's loading in.
	return true;
});

const commentStoreDirtyState = computed(() => {
	const store = getCommentStore(
		commentManager,
		getCommentModelResourceName(model),
		model.id
	);
	if (store instanceof CommentStoreModel) {
		return store.overviewNeedsRefresh;
	}
	return false;
});

watch(commentStoreDirtyState, dirtyState => {
	if (dirtyState) {
		const store = getCommentStore(
			commentManager,
			getCommentModelResourceName(model),
			model.id
		);
		if (store instanceof CommentStoreModel) {
			store.overviewNeedsRefresh = false;
		}

		emit('reload-comments');
	}
});

function open(comment: CommentModel) {
	showCommentThreadModal({
		router,
		model,
		commentId: comment.id,
		displayMode,
	});
}
</script>

<template>
	<div v-if="displayComments.length > 0" class="comment-overview sheet sheet-full">
		<!--
			Capture the click and prevent default so that no links within the content open up.
		-->
		<div v-for="comment of displayComments" :key="comment.id" class="-comment-container">
			<div class="-comment" @click.capture.prevent="open(comment)">
				<div class="-byline">
					<div class="-avatar">
						<AppUserCardHover :user="comment.user">
							<AppUserAvatarBubble
								:user="comment.user"
								disable-link
								show-frame
								show-verified
								smoosh
								verified-size="small"
							/>
						</AppUserCardHover>
					</div>

					<strong>{{ comment.user.display_name }}</strong>
					{{ ' ' }}
					<small class="text-muted">@{{ comment.user.username }}</small>
				</div>
				<AppFadeCollapse :collapse-height="150">
					<div class="-content">
						<AppContentViewer :source="comment.comment_content" />
					</div>
				</AppFadeCollapse>
			</div>
		</div>
	</div>
	<AppIllustration v-else-if="!hasComments" :asset="illNoCommentsSmall" sm>
		<template v-if="displayMode === 'comments'">
			{{ $gettext(`No comments yet.`) }}
		</template>
		<template v-else-if="displayMode === 'shouts'">
			{{ $gettext(`No shouts yet.`) }}
		</template>
	</AppIllustration>
</template>

<style lang="stylus" scoped>
.comment-overview .-comment-container:not(:last-child)
	border-bottom-width: $border-width-large
	border-bottom-style: solid
	border-color: var(--theme-bg-backdrop)

.-comment-container:last-child
	.-comment
		border-bottom-left-radius: $border-radius-large
		border-bottom-right-radius: $border-radius-large

.-comment-container:first-child
	.-comment
		border-top-left-radius: $border-radius-large
		border-top-right-radius: $border-radius-large

.-comment
	padding: 12px 8px

	&:hover
		change-bg('bg-offset')
		cursor: pointer

.-byline
	clearfix()
	text-overflow()
	margin-bottom: 12px
	line-height: 30px

.-avatar
	float: left
	margin-right: 8px
	width: 28px

.-content
	font-size: $font-size-small
</style>
