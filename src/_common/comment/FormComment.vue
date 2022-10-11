<script lang="ts" setup>
import { computed, nextTick, PropType, ref, toRefs } from 'vue';
import { trackCommentAdd } from '../analytics/analytics.service';
import AppButton from '../button/AppButton.vue';
import { ContentContext, ContextCapabilities } from '../content/content-context';
import { ContentRules } from '../content/content-editor/content-rules';
import AppForm, { createForm, defineFormProps, FormController } from '../form-vue/AppForm.vue';
import AppFormButton from '../form-vue/AppFormButton.vue';
import AppFormControlErrors from '../form-vue/AppFormControlErrors.vue';
import AppFormGroup from '../form-vue/AppFormGroup.vue';
import AppFormControlContent from '../form-vue/controls/AppFormControlContent.vue';
import {
	validateContentMaxLength,
	validateContentNoActiveUploads,
	validateContentRequired,
} from '../form-vue/validators';
import AppLinkHelp from '../link/AppLinkHelp.vue';
import { Model } from '../model/model.service';
import { Screen } from '../screen/screen-service';
import AppTranslate from '../translate/AppTranslate.vue';
import { Comment, getCommentModelResourceName } from './comment-model';
import './comment.styl';

const props = defineProps({
	commentModel: {
		type: Object as PropType<Model>,
		required: true,
	},
	parentId: {
		type: Number,
		default: undefined,
	},
	autofocus: {
		type: Boolean,
	},
	placeholder: {
		type: String,
		default: undefined,
	},
	...defineFormProps<Comment>(true),
});

const { commentModel, parentId, autofocus, placeholder, model } = toRefs(props);

const emit = defineEmits({
	editorFocus: () => true,
	editorBlur: () => true,
	cancel: () => true,
});

const lengthLimit = ref(5_000);
const contentCapabilities = ref<ContextCapabilities>();

const loadUrl = computed(() => {
	if (model.value?.id) {
		return `/comments/save/${model.value.id}`;
	} else {
		return `/comments/save?resource=${getCommentModelResourceName(commentModel.value)}`;
	}
});

const displayRules = computed(() => {
	if (Screen.isMobile) {
		return new ContentRules({ maxMediaWidth: 200, maxMediaHeight: 200 });
	}

	return new ContentRules({ maxMediaWidth: 300, maxMediaHeight: 300 });
});

const maxHeight = computed(() => {
	if (Screen.isMobile) {
		return 250;
	}

	return 400;
});

const contentContext = computed<ContentContext>(() => {
	switch (getCommentModelResourceName(commentModel.value)) {
		case 'Fireside_Post':
			return 'fireside-post-comment';
		case 'Game':
			return 'game-comment';
		case 'User':
			return 'user-comment';
	}
});

const shouldShowGuidelines = computed(
	() => !form.formModel.comment_content && !form.changed && form.method !== 'edit'
);

const contentModelId = computed(() => model.value?.id);

const form: FormController<Comment> = createForm({
	loadUrl,
	model,
	modelClass: Comment,
	resetOnSubmit: true,
	async onInit() {
		if (!model.value) {
			form.formModel.comment_content = '';
			form.formModel.resource = getCommentModelResourceName(commentModel.value);
			form.formModel.resource_id = commentModel.value.id;

			if (parentId?.value) {
				form.formModel.parent_id = parentId.value;
			}

			// Wait for errors, then clear them.
			await nextTick();
			form.clearErrors();
		}
	},
	onLoad(payload) {
		lengthLimit.value = payload.lengthLimit;

		if (payload.contentCapabilities) {
			contentCapabilities.value = ContextCapabilities.fromStringList(
				payload.contentCapabilities
			);
		}
	},
	onSubmitSuccess() {
		if (form.method === 'add') {
			trackCommentAdd();
		}
	},
});
</script>

<template>
	<AppForm :controller="form">
		<AppFormGroup name="comment_content" :label="$gettext('Leave a Comment')" hide-label>
			<AppFormControlContent
				:placeholder="placeholder || $gettext(`Leave a comment...`)"
				:content-context="contentContext"
				:context-capabilities-override="contentCapabilities"
				:autofocus="autofocus"
				:validators="[
					validateContentRequired(),
					validateContentNoActiveUploads(),
					validateContentMaxLength(lengthLimit),
				]"
				:max-height="maxHeight"
				:display-rules="displayRules"
				:model-id="contentModelId"
				focus-end
				@focus="emit('editorFocus')"
				@blur="emit('editorBlur')"
			/>

			<AppFormControlErrors label="comment" />
		</AppFormGroup>

		<p v-if="shouldShowGuidelines" class="-guidelines">
			Remember to be respectful and follow our
			<AppLinkHelp page="guidelines">Site Guidelines</AppLinkHelp>.
		</p>
		<div v-else class="-buttons">
			<AppButton v-if="form.method === 'edit'" trans @click="emit('cancel')">
				<AppTranslate>Cancel</AppTranslate>
			</AppButton>

			<AppFormButton show-when-valid>
				<AppTranslate v-if="form.method === 'add'">Add Comment</AppTranslate>
				<AppTranslate v-else-if="form.method === 'edit'">Save</AppTranslate>
			</AppFormButton>
		</div>
	</AppForm>
</template>

<style lang="stylus" scoped>
.-guidelines
	font-size: $font-size-small
	margin-bottom: 8px

.-buttons
	text-align: right

::v-deep(.form-group)
	margin-bottom: 8px
</style>
