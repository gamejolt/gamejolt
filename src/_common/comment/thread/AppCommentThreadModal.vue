<script lang="ts" setup>
import { computed, inject, PropType, ref, toRefs } from 'vue';
import { Analytics } from '../../analytics/analytics.service';
import AppButton from '../../button/AppButton.vue';
import AppMessageThreadAdd from '../../message-thread/add/add.vue';
import AppModal from '../../modal/AppModal.vue';
import { useModal } from '../../modal/modal.service';
import { Model } from '../../model/model.service';
import { useCommonStore } from '../../store/common-store';
import AppTranslate from '../../translate/AppTranslate.vue';
import { $gettext } from '../../translate/translate.service';
import FormComment from '../add/add.vue';
import { canCommentOnModel, Comment, getCommentModelResourceName } from '../comment-model';
import { CommentStoreManagerKey, getCommentStore, onCommentAdd } from '../comment-store';
import AppCommentWidget from '../widget/widget.vue';

const props = defineProps({
	commentId: {
		type: Number,
		required: true,
	},
	model: {
		type: Object as PropType<Model>,
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
	add: (_comment: Comment) => true,
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

const shouldShowReply = computed(() => {
	if (!canCommentOnModel(model.value, parent.value)) {
		return false;
	}

	return user.value && !hasError.value;
});

function _onCommentAdd(comment: Comment) {
	Analytics.trackEvent('comment-widget', 'add');
	onCommentAdd(commentManager, comment);
	emit('add', comment);
}

function onRemove(_comment: Comment) {
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

		<template v-if="shouldShowReply" #footer>
			<div>
				<AppMessageThreadAdd
					v-if="parent"
					hide-message-split
					:class="{ '-thread-editor-focus': isEditorFocused }"
				>
					<FormComment
						:comment-model="model"
						:parent-id="parent.id"
						:placeholder="$gettext(`Leave a reply...`)"
						:autofocus="autofocus"
						@submit="_onCommentAdd"
						@editor-focus="onEditorFocus"
						@editor-blur="onEditorBlur"
					/>
				</AppMessageThreadAdd>
			</div>
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
