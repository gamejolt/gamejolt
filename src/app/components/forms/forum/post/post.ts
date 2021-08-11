import { Component, Prop } from 'vue-property-decorator';
import AppFormControlContent from '../../../../../_common/form-vue/control/content/content.vue';
import AppForm from '../../../../../_common/form-vue/form';
import { BaseForm, FormOnInit } from '../../../../../_common/form-vue/form.service';
import { ForumPost } from '../../../../../_common/forum/post/post.model';
import { ForumTopic } from '../../../../../_common/forum/topic/topic.model';

@Component({
	components: {
		AppFormControlContent,
	},
})
export default class FormForumPost extends BaseForm<ForumPost> implements FormOnInit {
	@Prop(ForumTopic) topic!: ForumTopic;
	@Prop(ForumPost) replyTo?: ForumPost;

	declare $refs: {
		form: AppForm;
	};

	modelClass = ForumPost;
	resetOnSubmit = true;

	async onInit() {
		this.setField('topic_id', this.topic.id);

		if (this.replyTo) {
			this.setField('reply_to', this.replyTo.id); // Post ID.
		}

		if (!this.model) {
			this.setField('text_content', '');

			// Wait for errors to appear, then clear them.
			await this.$nextTick();
			this.$refs.form.clearErrors();
		}
	}

	onCancel() {
		this.$emit('cancel');
	}
}
