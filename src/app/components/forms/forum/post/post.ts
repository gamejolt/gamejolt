import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./post.html';

import { ForumPost } from '../../../../../lib/gj-lib-client/components/forum/post/post.model';
import {
	BaseForm,
	FormOnInit,
} from '../../../../../lib/gj-lib-client/components/form-vue/form.service';
import { ForumTopic } from '../../../../../lib/gj-lib-client/components/forum/topic/topic.model';
import { AppFormControlMarkdown } from '../../../../../lib/gj-lib-client/components/form-vue/control/markdown/markdown';

@View
@Component({
	components: {
		AppFormControlMarkdown,
	},
})
export class FormForumPost extends BaseForm<ForumPost> implements FormOnInit {
	@Prop(ForumTopic) topic: ForumTopic;
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
