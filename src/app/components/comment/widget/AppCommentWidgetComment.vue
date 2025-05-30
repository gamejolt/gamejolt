<script lang="ts" setup>
import { computed, onMounted, PropType, ref, toRef, toRefs, useTemplateRef } from 'vue';
import { Clipboard } from '../../../../_common/clipboard/clipboard-service';
import { CollaboratorModel } from '../../../../_common/collaborator/collaborator.model';
import AppCommentBlocked from '../../../../_common/comment/AppCommentBlocked.vue';
import AppCommentContent from '../../../../_common/comment/AppCommentContent.vue';
import {
	$followComment,
	$unfollowComment,
	canCommentOnModel,
	CommentableModel,
	CommentModel,
	getCommentBlockReason,
	removeComment,
} from '../../../../_common/comment/comment-model';
import { Environment } from '../../../../_common/environment/environment.service';
import AppJolticon from '../../../../_common/jolticon/AppJolticon.vue';
import { FormCommentLazy } from '../../../../_common/lazy';
import AppMessageThreadItem from '../../../../_common/message-thread/AppMessageThreadItem.vue';
import { showModalConfirm } from '../../../../_common/modal/confirm/confirm-service';
import { Model } from '../../../../_common/model/model.service';
import AppPopper from '../../../../_common/popper/AppPopper.vue';
import { Popper } from '../../../../_common/popper/popper.service';
import { showReportModal } from '../../../../_common/report/modal/modal.service';
import { useCommonStore } from '../../../../_common/store/common-store';
import { vAppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import { $gettext } from '../../../../_common/translate/translate.service';
import AppCommentControls from '../controls/AppCommentControls.vue';
import { useCommentWidget } from './AppCommentWidget.vue';

const props = defineProps({
	model: {
		type: Object as PropType<Model & CommentableModel>,
		required: true,
	},
	comment: {
		type: Object as PropType<CommentModel>,
		required: true,
	},
	children: {
		type: Array as PropType<CommentModel[]>,
		default: () => [],
	},
	parent: {
		type: Object as PropType<CommentModel>,
		default: undefined,
	},
	isLastInThread: {
		type: Boolean as PropType<boolean>,
		default: false,
	},
	showChildren: {
		type: Boolean as PropType<boolean>,
		default: false,
	},
});

const { model, parent, comment, children, showChildren, isLastInThread } = toRefs(props);
const { user } = useCommonStore();
const {
	threadCommentId,
	resourceOwner,
	collaborators,
	onCommentEdit,
	onCommentRemove,
	pinComment,
} = useCommentWidget()!;

const isEditing = ref(false);
const hasBypassedBlock = ref(false);

const scrollTargetRef = useTemplateRef('scrollTarget');

const isReply = toRef(() => !!parent?.value);
const isActive = toRef(() => threadCommentId.value === comment.value.id);

const isOwner = toRef(() => {
	if (!resourceOwner.value) {
		return false;
	}

	return resourceOwner.value.id === comment.value.user.id;
});

const isCollaborator = computed(() => {
	if (!collaborators.value.length) {
		return false;
	}

	return !!collaborators.value.some(i => i.user_id === comment.value.user.id);
});

/**
 * Whether or not they own the resource this comment was posted to, or they are a collaborator
 * on the resource with the correct permissions..
 */
const hasModPermissions = computed(() => {
	if (!user.value) {
		return false;
	}

	// The owner of the resource the comment is attached to can remove.
	if (resourceOwner.value && resourceOwner.value.id === user.value.id) {
		return true;
	}

	// A collaborator for the game the comment is attached to can remove,
	// if they have the comments permission.
	if (collaborators.value.length) {
		const collaborator = collaborators.value.find(i => i.user_id === user.value!.id);

		if (collaborator instanceof CollaboratorModel) {
			if (collaborator.perms.includes('all') || collaborator.perms.includes('comments')) {
				return true;
			}
		}
	}

	return false;
});

const canRemove = toRef(() => {
	if (!user.value) {
		return false;
	}

	// The comment author can remove their own comments.
	if (user.value.id === comment.value.user.id) {
		return true;
	}

	return hasModPermissions.value;
});

const canPin = toRef(() => {
	if (!user.value) {
		return false;
	}

	// Must have "mod" permissions to be able to pin.
	return !comment.value.parent_id && hasModPermissions.value;
});

const isShowingReplies = toRef(() => children.value.length > 0 && showChildren.value);

const canFollow = toRef(() => {
	// Can't subscribe if...
	// they aren't logged in
	// this is a child comment
	// the resource belongs to them
	if (!user.value) {
		return false;
	} else if (isReply.value) {
		return false;
	} else if (resourceOwner.value && resourceOwner.value.id === user.value.id) {
		return false;
	}

	return true;
});

const blockReason = computed(() => getCommentBlockReason(comment.value));

const isBlocked = toRef(() => {
	if (hasBypassedBlock.value || !comment.value) {
		return false;
	}

	return blockReason.value !== false;
});

const showReplies = toRef(() => !parent?.value && !showChildren.value);
const canReply = computed(() => showReplies.value && canCommentOnModel(model.value, parent?.value));
const canReact = toRef(() => {
	if (comment.value.user.hasAnyBlock === true || parent?.value?.user.hasAnyBlock === true) {
		return false;
	}
	return model.value.canInteractWithComments;
});
const canVote = toRef(() => model.value.canInteractWithComments);

onMounted(() => {
	// Scroll it into view if it's active.
	if (isActive.value) {
		setTimeout(() => {
			scrollTargetRef.value?.scrollIntoView({ behavior: 'smooth' });
		}, 250);
	}
});

function startEdit() {
	isEditing.value = true;
	Popper.hideAll();
}

function commentEdited(comment: CommentModel) {
	isEditing.value = false;
	onCommentEdit(comment);
}

async function doRemoveComment() {
	isEditing.value = false;
	Popper.hideAll();

	const result = await showModalConfirm(
		$gettext(`Are you sure you want to remove this comment?`)
	);

	if (!result) {
		return;
	}

	try {
		await removeComment(comment.value);
	} catch (err) {
		console.warn('Failed to remove comment');
		return;
	}

	onCommentRemove(comment.value);
}

function onFollowClick() {
	if (!comment.value.subscription) {
		$followComment(comment.value);
	} else {
		$unfollowComment(comment.value);
	}
}

function copyPermalink() {
	Clipboard.copy(comment.value.permalink);
}

function report() {
	showReportModal(comment.value);
}

function onUnhideBlock() {
	hasBypassedBlock.value = true;
}
</script>

<template>
	<AppMessageThreadItem
		:user="isBlocked ? null : comment.user"
		:date="comment.posted_on"
		:is-showing-replies
		:is-reply
		:is-last="isLastInThread"
		:is-active
		:is-blocked
	>
		<template v-if="comment.is_pinned || isOwner || isCollaborator" #tags>
			<span v-if="comment.is_pinned" class="tag">
				<AppJolticon icon="thumbtack" />
				<AppTranslate>Pinned</AppTranslate>
			</span>

			<span v-if="isOwner" class="tag">
				<AppTranslate>Owner</AppTranslate>
			</span>
			<span v-else-if="isCollaborator" class="tag">
				<AppTranslate>Collaborator</AppTranslate>
			</span>
		</template>

		<template #meta>
			<AppPopper v-if="user" popover-class="fill-darkest">
				<a v-app-tooltip="$gettext('More Options')" class="link-muted">
					<AppJolticon icon="ellipsis-v" class="middle" />
				</a>

				<template #popover>
					<div class="list-group list-group-dark">
						<a class="list-group-item has-icon" @click="copyPermalink">
							<AppJolticon icon="link" />
							<AppTranslate>Copy Link</AppTranslate>
						</a>
						<a
							v-if="canPin"
							class="list-group-item has-icon"
							@click="pinComment(comment)"
						>
							<AppJolticon icon="thumbtack" />
							<AppTranslate v-if="comment.is_pinned">Unpin Comment</AppTranslate>
							<AppTranslate v-else>Pin Comment</AppTranslate>
						</a>
						<a
							v-if="user.id === comment.user.id"
							class="list-group-item has-icon"
							@click="startEdit"
						>
							<AppJolticon icon="edit" />
							<AppTranslate>Edit Comment</AppTranslate>
						</a>
						<a
							v-if="canFollow"
							v-app-tooltip.left="
								comment.subscription
									? $gettext(
											`You're following this comment thread and will be notified of replies.`
									  )
									: $gettext(
											`Get notifications when people post new replies to this thread.`
									  )
							"
							class="list-group-item has-icon"
							@click="onFollowClick"
						>
							<AppJolticon icon="subscribe" />
							<AppTranslate v-if="comment.subscription">Following</AppTranslate>
							<AppTranslate v-else>Follow Thread</AppTranslate>
						</a>
						<a
							v-if="canRemove"
							class="list-group-item has-icon"
							@click="doRemoveComment"
						>
							<AppJolticon icon="remove" notice />
							<AppTranslate>Remove Comment</AppTranslate>
						</a>
						<a
							v-if="user.id !== comment.user.id"
							class="list-group-item has-icon"
							@click="report"
						>
							<AppJolticon icon="flag" notice />
							<AppTranslate>Report Comment</AppTranslate>
						</a>
						<a
							v-if="user.permission_level >= 3"
							class="list-group-item has-icon"
							:href="`${Environment.baseUrl}/moderate/comments/remove/${comment.id}`"
							target="_blank"
						>
							<AppJolticon icon="remove" notice />
							<template v-if="canRemove">
								<AppTranslate>Remove Comment (Moderate)</AppTranslate>
							</template>
							<template v-else>
								<AppTranslate>Remove Comment</AppTranslate>
							</template>
						</a>
					</div>
				</template>
			</AppPopper>
		</template>

		<template #default>
			<!--
			When scrolling an active comment into view, we don't want to target
			the top of the comment. We want to stop the scroll a bit higher in
			the viewport, so we hack this scroll target into the DOM and place
			it higher up than the comment itself.
			-->
			<div ref="scrollTarget" class="-scroll-target" />

			<template v-if="!isEditing">
				<AppCommentContent :comment :can-react :content="comment.comment_content" />
			</template>
			<template v-else>
				<FormCommentLazy
					:comment
					:model
					@submit="commentEdited"
					@cancel="isEditing = false"
				/>
			</template>
		</template>

		<template #controls>
			<AppCommentControls
				:model
				:comment
				:children
				:show-reply="showReplies"
				:can-reply
				:can-vote
				:can-react
			/>
		</template>

		<!-- Child Comments -->
		<template v-if="isShowingReplies" #replies>
			<!-- Frustrating, but it seems like vue language server can't figure out the recursion -->
			<AppCommentWidgetComment
				v-for="(child, i) of children"
				:key="child.id"
				:model
				:comment="child"
				:parent="comment"
				:is-last-in-thread="i === children.length - 1"
			/>
		</template>

		<template #blocked>
			<AppCommentBlocked
				v-if="blockReason && isBlocked"
				:comment
				:reason="blockReason"
				@show="onUnhideBlock"
			/>
		</template>
	</AppMessageThreadItem>
</template>

<style lang="stylus" scoped>
.-scroll-target
	position: absolute
	top: -100px
</style>
