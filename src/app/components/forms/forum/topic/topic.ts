import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./topic.html';

import {
	BaseForm,
	FormOnInit,
} from '../../../../../lib/gj-lib-client/components/form-vue/form.service';
import { ForumTopic } from '../../../../../lib/gj-lib-client/components/forum/topic/topic.model';
import { ForumChannel } from '../../../../../lib/gj-lib-client/components/forum/channel/channel.model';
import { AppFormControlMarkdown } from '../../../../../lib/gj-lib-client/components/form-vue/control/markdown/markdown';

@View
@Component({
	components: {
		AppFormControlMarkdown,
	},
})
export class FormForumTopic extends BaseForm<ForumTopic> implements FormOnInit {
	@Prop(ForumChannel) channel: ForumChannel;

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
