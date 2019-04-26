import AppFormControlContent from 'game-jolt-frontend-lib/components/form-vue/control/content/content.vue';
import { BaseForm, FormOnInit } from 'game-jolt-frontend-lib/components/form-vue/form.service';
import { ForumChannel } from 'game-jolt-frontend-lib/components/forum/channel/channel.model';
import { ForumTopic } from 'game-jolt-frontend-lib/components/forum/topic/topic.model';
import { Component, Prop } from 'vue-property-decorator';

@Component({
	components: {
		AppFormControlContent,
	},
})
export default class FormForumTopic extends BaseForm<ForumTopic> implements FormOnInit {
	@Prop(ForumChannel) channel!: ForumChannel;

	modelClass = ForumTopic;

	onInit() {
		this.setField('channel_id', this.channel.id);

		if (this.method === 'edit' && this.model) {
			this.setField('text_content', this.model.main_post.text_content);
		}
	}

	onCancel() {
		this.$emit('cancel');
	}
}
