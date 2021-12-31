import { Emit, Options, Prop } from 'vue-property-decorator';
import AppFormControlContent from '../../../../../_common/form-vue/controls/AppFormControlContent.vue';
import { BaseForm } from '../../../../../_common/form-vue/form.service';
import {
	validateContentMaxLength,
	validateContentNoActiveUploads,
	validateContentRequired,
} from '../../../../../_common/form-vue/validators';
import { ForumChannel } from '../../../../../_common/forum/channel/channel.model';
import { ForumTopic } from '../../../../../_common/forum/topic/topic.model';

@Options({
	components: {
		AppFormControlContent,
	},
})
export default class FormForumTopic extends BaseForm<ForumTopic> {
	@Prop(ForumChannel) channel!: ForumChannel;

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
		}
	}

	onCancel() {
		this.emitCancel();
	}
}
