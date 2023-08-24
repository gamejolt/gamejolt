<script lang="ts" setup>
import { computed, nextTick, PropType, ref, toRefs } from 'vue';
import { kFontSizeSmall } from '../../_styles/variables';
import AppAlertBox from '../alert/AppAlertBox.vue';
import { trackCommentAdd } from '../analytics/analytics.service';
import AppButton from '../button/AppButton.vue';
import { ContentContext, ContextCapabilities } from '../content/content-context';
import { ContentRules } from '../content/content-editor/content-rules';
import { FiresidePost } from '../fireside/post/post-model';
import AppForm, { createForm, FormController } from '../form-vue/AppForm.vue';
import AppFormButton from '../form-vue/AppFormButton.vue';
import AppFormControlErrors from '../form-vue/AppFormControlErrors.vue';
import AppFormGroup from '../form-vue/AppFormGroup.vue';
import AppFormControlContent from '../form-vue/controls/AppFormControlContent.vue';
import {
	validateContentMaxLength,
	validateContentNoActiveUploads,
	validateContentRequired,
} from '../form-vue/validators';
import { showErrorGrowl } from '../growls/growls.service';
import AppLinkHelp from '../link/AppLinkHelp.vue';
import { Model } from '../model/model.service';
import { Screen } from '../screen/screen-service';
import AppSpacer from '../spacer/AppSpacer.vue';
import AppTranslate from '../translate/AppTranslate.vue';
import { $gettext } from '../translate/translate.service';
import {
	canCommentOnModel,
	Comment,
	CommentableModel,
	getCommentModelResourceName,
	saveComment,
} from './comment-model';
import './comment.styl';

const props = defineProps({
	comment: {
		type: Object as PropType<Comment>,
		default: undefined,
	},
	/** The model that the comment is attached to */
	model: {
		type: Object as PropType<CommentableModel & Model>,
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
});

const { comment, model, parentId, autofocus, placeholder } = toRefs(props);

const emit = defineEmits({
	submit: (_model: Comment) => true,
	'editor-focus': () => true,
	'editor-blur': () => true,
	cancel: () => true,
});

const lengthLimit = ref(5_000);
const contentCapabilities = ref(ContextCapabilities.getPlaceholder());

const loadUrl = computed(() => {
	if (comment?.value?.id) {
		return `/comments/save/${comment.value.id}`;
	} else {
		return `/comments/save?resource=${getCommentModelResourceName(model.value)}`;
	}
});

type FormModel = {
	id?: Comment['id'];
	comment_content: Comment['comment_content'];
	resource: Comment['resource'];
	resource_id: Comment['resource_id'];
	parent_id: Comment['parent_id'];
};

const form: FormController<FormModel> = createForm({
	resetOnSubmit: true,
	loadUrl,
	async onInit() {
		const _comment = comment?.value;

		form.method = _comment ? 'edit' : 'add';
		form.formModel.id = _comment?.id;

		form.formModel.comment_content = _comment?.comment_content ?? '';
		form.formModel.resource = _comment?.resource ?? getCommentModelResourceName(model.value);
		form.formModel.resource_id = _comment?.resource_id ?? model.value.id;
		form.formModel.parent_id = _comment?.parent_id ?? parentId?.value;

		// Wait for errors, then clear them.
		await nextTick();
		form.clearErrors();
	},
	onLoad(payload: any) {
		lengthLimit.value = payload.lengthLimit;
		contentCapabilities.value = ContextCapabilities.fromPayloadList(
			payload.contentCapabilities
		);
	},
	onSubmit: () => saveComment(form.formModel),
	onSubmitSuccess(savedComment) {
		if (form.method === 'add') {
			trackCommentAdd();
		}
		emit('submit', savedComment);
	},
	onSubmitError() {
		showErrorGrowl($gettext(`Couldn't add your comment for some reason.`));
	},
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

const contentContext = computed((): ContentContext => {
	switch (getCommentModelResourceName(model.value)) {
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

const contentModelId = computed(() => comment?.value?.id);
const canComment = computed(() => canCommentOnModel(model.value));

/** If the model we're commenting on is a post, this will return it. */
const postModel = computed(() => (model.value instanceof FiresidePost ? model.value : undefined));

/** Whether or not only friends can comment */
const onlyFriends = computed(
	() => postModel.value?.allow_comments === FiresidePost.ALLOW_COMMENTS_FRIENDS
);
</script>

<template>
	<template v-if="!canComment">
		<AppAlertBox icon="notice">
			<AppTranslate
				v-if="onlyFriends"
				:translate-params="{ user: postModel?.displayUser?.username }"
			>
				Only friends of @%{ user } can comment.
			</AppTranslate>
			<AppTranslate v-else>You're unable to comment on this.</AppTranslate>
		</AppAlertBox>

		<AppSpacer vertical :scale="4" />
	</template>
	<AppForm v-else :controller="form">
		<AppFormGroup name="comment_content" :label="$gettext('Leave a Comment')" hide-label>
			<AppFormControlContent
				:placeholder="placeholder || $gettext(`Leave a comment...`)"
				:content-context="contentContext"
				:capabilities="contentCapabilities"
				:autofocus="autofocus"
				:validators="[
					validateContentRequired(),
					validateContentNoActiveUploads(),
					validateContentMaxLength(lengthLimit),
				]"
				:max-height="maxHeight"
				:display-rules="displayRules"
				:model-data="
					comment
						? {
								type: 'resource',
								resource: 'Comment',
								resourceId: comment.id,
						  }
						: {
								type: 'commentingOnResource',
								resource: getCommentModelResourceName(model),
								resourceId: model.id,
						  }
				"
				:model-id="contentModelId"
				focus-end
				@focus="emit('editor-focus')"
				@blur="emit('editor-blur')"
			/>

			<AppFormControlErrors label="comment" />
		</AppFormGroup>

		<p
			v-if="shouldShowGuidelines"
			:style="{
				fontSize: kFontSizeSmall.px,
				marginBottom: `8px`,
			}"
		>
			Remember to be respectful and follow our
			<AppLinkHelp page="guidelines">Site Guidelines</AppLinkHelp>.
		</p>
		<div
			v-else
			:style="{
				textAlign: `right`,
			}"
		>
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
::v-deep(.form-group)
	margin-bottom: 8px
</style>
