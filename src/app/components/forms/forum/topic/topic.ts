import AppFormControlContent from '../../../../../_common/form-vue/control/content/content.vue';
import { BaseForm, FormOnInit } from '../../../../../_common/form-vue/form.service';
import { ForumChannel } from '../../../../../_common/forum/channel/channel.model';
import { ForumTopic } from '../../../../../_common/forum/topic/topic.model';
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
