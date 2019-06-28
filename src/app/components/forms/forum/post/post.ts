import AppFormControlContent from 'game-jolt-frontend-lib/components/form-vue/control/content/content.vue';
import AppForm from 'game-jolt-frontend-lib/components/form-vue/form';
import { BaseForm, FormOnInit } from 'game-jolt-frontend-lib/components/form-vue/form.service';
import { ForumPost } from 'game-jolt-frontend-lib/components/forum/post/post.model';
import { ForumTopic } from 'game-jolt-frontend-lib/components/forum/topic/topic.model';
import { Component, Prop } from 'vue-property-decorator';

@Component({
	components: {
		AppFormControlContent,
	},
})
export default class FormForumPost extends BaseForm<ForumPost> implements FormOnInit {
	@Prop(ForumTopic) topic!: ForumTopic;
	@Prop(ForumPost) replyTo?: ForumPost;

	$refs!: {
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
