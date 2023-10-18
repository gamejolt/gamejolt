<script lang="ts" setup>
import { computed, inject, PropType, ref, toRefs } from 'vue';
import AppButton from '../../../../_common/button/AppButton.vue';
import AppCommentDisabledCheck from '../../../../_common/comment/AppCommentDisabledCheck.vue';
import {
	CommentableModel,
	CommentModel,
	getCommentModelResourceName,
} from '../../../../_common/comment/comment-model';
import {
	commentStoreHandleAdd,
	CommentStoreManagerKey,
	getCommentStore,
} from '../../../../_common/comment/comment-store';
import { FormCommentLazy } from '../../../../_common/lazy';
import AppMessageThreadAdd from '../../../../_common/message-thread/AppMessageThreadAdd.vue';
import AppModal from '../../../../_common/modal/AppModal.vue';
import { useModal } from '../../../../_common/modal/modal.service';
import { Model } from '../../../../_common/model/model.service';
import { useCommonStore } from '../../../../_common/store/common-store';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import { $gettext } from '../../../../_common/translate/translate.service';
import AppCommentWidget from '../widget/AppCommentWidget.vue';

const props = defineProps({
	commentId: {
		type: Number,
		required: true,
	},
	model: {
		type: Object as PropType<Model & CommentableModel>,
		required: true,
	},
	displayMode: {
		type: String,
		required: true,
	},
	autofocus: {
		type: Boolean,
	},
});

const emit = defineEmits({
	add: (_comment: CommentModel) => true,
});

const { commentId, model, autofocus } = toRefs(props);

const { user } = useCommonStore();
const commentManager = inject(CommentStoreManagerKey)!;
const modal = useModal()!;

const hasError = ref(false);
const isEditorFocused = ref(false);

const parent = computed(() => {
	const store = getCommentStore(
		commentManager,
		getCommentModelResourceName(model.value),
		model.value.id
	);
	if (store) {
		const comment = store.comments.find(c => c.id === commentId.value);
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
