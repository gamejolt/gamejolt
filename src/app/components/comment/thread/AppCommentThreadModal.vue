<script lang="ts" setup>
import { computed, ref } from 'vue';

import AppCommentWidget from '~app/components/comment/widget/AppCommentWidget.vue';
import AppButton from '~common/button/AppButton.vue';
import AppCommentDisabledCheck from '~common/comment/AppCommentDisabledCheck.vue';
import {
	CommentableModel,
	CommentModel,
	getCommentModelResourceName,
} from '~common/comment/comment-model';
import {
	commentStoreHandleAdd,
	getCommentStore,
	useCommentStoreManager,
} from '~common/comment/comment-store';
import { FormCommentLazy } from '~common/lazy';
import AppMessageThreadAdd from '~common/message-thread/AppMessageThreadAdd.vue';
import AppModal from '~common/modal/AppModal.vue';
import { useModal } from '~common/modal/modal.service';
import { Model } from '~common/model/model.service';
import { useCommonStore } from '~common/store/common-store';
import AppTranslate from '~common/translate/AppTranslate.vue';
import { $gettext } from '~common/translate/translate.service';

type Props = {
	commentId: number;
	model: Model & CommentableModel;
	displayMode: string;
	autofocus?: boolean;
};
const { commentId, model } = defineProps<Props>();

const emit = defineEmits<{
	add: [comment: CommentModel];
}>();

const { user } = useCommonStore();
const commentManager = useCommentStoreManager()!;
const modal = useModal()!;

const hasError = ref(false);
const isEditorFocused = ref(false);

const parent = computed(() => {
	const store = getCommentStore(
		commentManager,
		getCommentModelResourceName(model),
		model.id
	);
	if (store) {
		const comment = store.comments.find(c => c.id === commentId);
		if (comment && comment.parent_id) {
			const parent = store.comments.find(c => c.id === comment.parent_id);
			return parent;
		}
		return comment;
	}
});

function _onCommentAdd(comment: CommentModel) {
	commentStoreHandleAdd(commentManager, comment);
	emit('add', comment);
}

function onRemove(_comment: CommentModel) {
	// If the parent comment of the thread got removed, close this modal
	if (!parent.value) {
		modal.dismiss();
	}
}

function onError(_e: Error) {
	hasError.value = true;
}

function onEditorFocus() {
	isEditorFocused.value = true;
}

function onEditorBlur() {
	isEditorFocused.value = false;
}
</script>

<template>
	<AppModal>
		<div class="modal-controls">
			<AppButton @click="modal.dismiss()">
				<AppTranslate>Close</AppTranslate>
			</AppButton>
		</div>

		<AppCommentDisabledCheck :model="model">
			<div class="modal-body">
				<AppCommentWidget
					:model="model"
					:thread-comment-id="commentId"
					:show-tabs="false"
					:show-add="false"
					@remove="onRemove"
					@error="onError"
				/>
			</div>
		</AppCommentDisabledCheck>

		<template #footer>
			<AppMessageThreadAdd
				v-if="user && !hasError && parent"
				:class="{ '-thread-editor-focus': isEditorFocused }"
				hide-message-split
			>
				<FormCommentLazy
					:model="model"
					:parent-id="parent?.id"
					:placeholder="$gettext(`Leave a reply...`)"
					:autofocus="autofocus"
					@submit="_onCommentAdd"
					@editor-focus="onEditorFocus"
					@editor-blur="onEditorBlur"
				/>
			</AppMessageThreadAdd>
		</template>
	</AppModal>
</template>

<style lang="stylus" scoped>
// On mobile, we need to make space for the content editor controls. They
// would overlap the Reply form field otherwise.
@media $media-xs
	::v-deep(.message-thread-add.-thread-editor-focus)
		padding-bottom: 42px
</style>
