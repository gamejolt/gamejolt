<script lang="ts">
import { Emit, mixins, Options, Prop } from 'vue-property-decorator';
import { ContextCapabilities } from '../../../../../_common/content/content-context';
import AppFormControlContent from '../../../../../_common/form-vue/controls/AppFormControlContent.vue';
import { BaseForm } from '../../../../../_common/form-vue/form.service';
import {
	validateContentMaxLength,
	validateContentNoActiveUploads,
	validateContentRequired,
} from '../../../../../_common/form-vue/validators';
import { ForumChannel } from '../../../../../_common/forum/channel/channel.model';
import { ForumTopic } from '../../../../../_common/forum/topic/topic.model';

class Wrapper extends BaseForm<ForumTopic> {}

@Options({
	components: {
		AppFormControlContent,
	},
})
export default class FormForumTopic extends mixins(Wrapper) {
	@Prop(Object) channel!: ForumChannel;

	modelClass = ForumTopic;

	readonly validateContentRequired = validateContentRequired;
	readonly validateContentMaxLength = validateContentMaxLength;
	readonly validateContentNoActiveUploads = validateContentNoActiveUploads;

	capabilities = ContextCapabilities.fromPayloadList([]);

	@Emit('cancel')
	emitCancel() {}

	onInit() {
		this.setField('channel_id', this.channel.id);

		if (this.method === 'edit' && this.model) {
			this.setField('text_content', this.model.main_post.text_content);
		} else {
			this.setField('text_content', '');
		}
	}

	onCancel() {
		this.emitCancel();
	}
}
</script>

<template>
	<AppForm :controller="form">
		<AppFormGroup name="title" :label="$gettext('Title')">
			<AppFormControl type="text" :validators="[validateMaxLength(300)]" />

			<AppFormControlErrors />
		</AppFormGroup>

		<AppFormGroup name="text_content" :label="$gettext('Topic Content')">
			<AppFormControlContent
				content-context="forum-post"
				:capabilities="capabilities"
				:validators="[validateContentRequired(), validateContentNoActiveUploads()]"
			/>

			<AppFormControlErrors />
		</AppFormGroup>

		<AppFormButton>
			<AppTranslate v-if="method === 'add'">Add Topic</AppTranslate>
			<AppTranslate v-if="method === 'edit'">Save</AppTranslate>
		</AppFormButton>

		<AppButton v-if="method === 'edit'" trans @click="onCancel">
			<AppTranslate>Cancel</AppTranslate>
		</AppButton>
	</AppForm>
</template>
