<script lang="ts" setup>
import '~common/comment/comment.styl';

import { computed, nextTick, ref } from 'vue';

import AppAlertBox from '~common/alert/AppAlertBox.vue';
import { trackCommentAdd } from '~common/analytics/analytics.service';
import AppButton from '~common/button/AppButton.vue';
import {
	canCommentOnModel,
	CommentableModel,
	CommentModel,
	getCommentModelResourceName,
	saveComment,
} from '~common/comment/comment-model';
import { ContentContext, ContextCapabilities } from '~common/content/content-context';
import { ContentRules } from '~common/content/content-rules';
import { FiresidePostAllowComments, FiresidePostModel } from '~common/fireside/post/post-model';
import AppForm, { createForm, FormController } from '~common/form-vue/AppForm.vue';
import AppFormButton from '~common/form-vue/AppFormButton.vue';
import AppFormControlErrors from '~common/form-vue/AppFormControlErrors.vue';
import AppFormGroup from '~common/form-vue/AppFormGroup.vue';
import AppFormControlContent from '~common/form-vue/controls/AppFormControlContent.vue';
import {
	validateContentMaxLength,
	validateContentNoActiveUploads,
	validateContentRequired,
} from '~common/form-vue/validators';
import { showErrorGrowl } from '~common/growls/growls.service';
import AppLinkHelp from '~common/link/AppLinkHelp.vue';
import { Model } from '~common/model/model.service';
import { Screen } from '~common/screen/screen-service';
import AppSpacer from '~common/spacer/AppSpacer.vue';
import AppTranslate from '~common/translate/AppTranslate.vue';
import { $gettext } from '~common/translate/translate.service';
import { kFontSizeSmall } from '~styles/variables';

type Props = {
	comment?: CommentModel;
	/** The model that the comment is attached to */
	model: CommentableModel & Model;
	parentId?: number;
	autofocus?: boolean;
	placeholder?: string;
};
const { comment, model, parentId } = defineProps<Props>();

const emit = defineEmits<{
	submit: [model: CommentModel];
	'editor-focus': [];
	'editor-blur': [];
	cancel: [];
}>();

const lengthLimit = ref(5_000);
const contentCapabilities = ref(ContextCapabilities.getPlaceholder());

const loadUrl = computed(() => {
	if (comment?.id) {
		return `/comments/save/${comment.id}`;
	} else {
		return `/comments/save?resource=${getCommentModelResourceName(model)}`;
	}
});

type FormModel = {
	id?: CommentModel['id'];
	comment_content: CommentModel['comment_content'];
	resource: CommentModel['resource'];
	resource_id: CommentModel['resource_id'];
	parent_id: CommentModel['parent_id'];
};

const form: FormController<FormModel> = createForm({
	resetOnSubmit: true,
	loadUrl,
	async onInit() {
		const _comment = comment;

		form.method = _comment ? 'edit' : 'add';
		form.formModel.id = _comment?.id;

		form.formModel.comment_content = _comment?.comment_content ?? '';
		form.formModel.resource = _comment?.resource ?? getCommentModelResourceName(model);
		form.formModel.resource_id = _comment?.resource_id ?? model.id;
		form.formModel.parent_id = _comment?.parent_id ?? parentId ?? 0;

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
	switch (getCommentModelResourceName(model)) {
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

const contentModelId = computed(() => comment?.id);
const canComment = computed(() => canCommentOnModel(model));

/** If the model we're commenting on is a post, this will return it. */
const postModel = computed(() => (model instanceof FiresidePostModel ? model : undefined));

/** Whether or not only friends can comment */
const onlyFriends = computed(
	() => postModel.value?.allow_comments === FiresidePostAllowComments.Friends
);
</script>

<template>
	<template v-if="!canComment">
		<AppAlertBox icon="notice">
			<AppTranslate
				v-if="onlyFriends"
				:translate-params="{ user: postModel?.displayUser?.username ?? '' }"
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
