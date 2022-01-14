<script lang="ts">
import { Emit, mixins, Options, Prop } from 'vue-property-decorator';
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
	<app-form :controller="form">
		<app-form-group name="title" :label="$gettext('Title')">
			<app-form-control type="text" :validators="[validateMaxLength(300)]" />

			<app-form-control-errors />
		</app-form-group>

		<app-form-group name="text_content" :label="$gettext('Topic Content')">
			<app-form-control-content
				content-context="forum-post"
				:validators="[validateContentRequired(), validateContentNoActiveUploads()]"
				:validate-on="['blur']"
			/>

			<app-form-control-errors />
		</app-form-group>

		<app-form-button>
			<translate v-if="method === 'add'">Add Topic</translate>
			<translate v-if="method === 'edit'">Save</translate>
		</app-form-button>

		<app-button v-if="method === 'edit'" trans @click="onCancel">
			<translate>Cancel</translate>
		</app-button>
	</app-form>
</template>
