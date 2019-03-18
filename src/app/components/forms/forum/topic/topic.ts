import AppFormControlMarkdown from 'game-jolt-frontend-lib/components/form-vue/control/markdown/markdown.vue';
import { BaseForm, FormOnInit } from 'game-jolt-frontend-lib/components/form-vue/form.service';
import { ForumChannel } from 'game-jolt-frontend-lib/components/forum/channel/channel.model';
import { ForumTopic } from 'game-jolt-frontend-lib/components/forum/topic/topic.model';
import { Component, Prop } from 'vue-property-decorator';


@Component({
	components: {
		AppFormControlMarkdown,
	},
})
export default class FormForumTopic extends BaseForm<ForumTopic> implements FormOnInit {
	@Prop(ForumChannel) channel!: ForumChannel;

	modelClass = ForumTopic;

	onInit() {
		this.setField('channel_id', this.channel.id);

		if (this.method === 'edit' && this.model) {
			this.setField('content_markdown', this.model.main_post.content_markdown);
		}
	}

	onCancel() {
		this.$emit('cancel');
	}
}
