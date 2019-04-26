import AppFormControlContent from 'game-jolt-frontend-lib/components/form-vue/control/content/content.vue';
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

	modelClass = ForumPost;
	resetOnSubmit = true;

	onInit() {
		this.setField('topic_id', this.topic.id);

		if (this.replyTo) {
			this.setField('reply_to', this.replyTo.id); // Post ID.
		}
	}

	onCancel() {
		this.$emit('cancel');
	}
}
