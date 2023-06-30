<script lang="ts" setup>
import { computed, inject, PropType, toRefs, watch } from 'vue';
import { useRouter } from 'vue-router';
import AppFadeCollapse from '../../../_common/AppFadeCollapse.vue';
import {
	Comment,
	getCommentBlockReason,
	getCommentModelResourceName,
} from '../../../_common/comment/comment-model';
import {
	CommentStoreManagerKey,
	CommentStoreModel,
	getCommentStore,
} from '../../../_common/comment/comment-store';
import { DisplayMode } from '../../../_common/comment/modal/modal.service';
import { CommentThreadModal } from '../../../_common/comment/thread/modal.service';
import AppContentViewer from '../../../_common/content/content-viewer/AppContentViewer.vue';
import AppIllustration from '../../../_common/illustration/AppIllustration.vue';
import { Model } from '../../../_common/model/model.service';
import AppUserCardHover from '../../../_common/user/card/AppUserCardHover.vue';
import AppUserAvatarBubble from '../../../_common/user/user-avatar/AppUserAvatarBubble.vue';
import { illNoCommentsSmall } from '../../../_common/illustration/illustrations';

const props = defineProps({
	comments: {
		type: Array as PropType<Comment[]>,
		required: true,
	},
	model: {
		type: Object as PropType<Model>,
		required: true,
	},
	displayMode: {
		type: String as PropType<DisplayMode>,
		required: true,
	},
});

const { comments, model, displayMode } = toRefs(props);

const emit = defineEmits({
	'reload-comments': () => true,
});

const commentManager = inject(CommentStoreManagerKey)!;
const router = useRouter();

const displayComments = computed(() => {
	return comments.value.filter(c => getCommentBlockReason(c) === false);
});

const hasComments = computed(() => {
	const store = getCommentStore(
		commentManager,
		getCommentModelResourceName(model.value),
		model.value.id
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
		getCommentModelResourceName(model.value),
		model.value.id
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
			getCommentModelResourceName(model.value),
			model.value.id
		);
		if (store instanceof CommentStoreModel) {
			store.overviewNeedsRefresh = false;
		}

		emit('reload-comments');
	}
});

function open(comment: Comment) {
	CommentThreadModal.show({
		router,
		model: model.value,
		commentId: comment.id,
		displayMode: displayMode.value,
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
