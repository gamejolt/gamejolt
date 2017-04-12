import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./post.html';

import { ForumPost } from '../../../../../lib/gj-lib-client/components/forum/post/post.model';
import { BaseForm } from '../../../../../lib/gj-lib-client/components/form-vue/form.service';
import { ForumTopic } from '../../../../../lib/gj-lib-client/components/forum/topic/topic.model';
import { AppFormControlMarkdown } from '../../../../../lib/gj-lib-client/components/form-vue/control/markdown/markdown';

@View
@Component({
	components: {
		AppFormControlMarkdown,
	},
})
export class FormForumPost extends BaseForm<ForumPost>
{
	@Prop( ForumTopic ) topic: ForumTopic;
	@Prop( ForumPost ) replyTo?: ForumPost;

	modelClass = ForumPost;
	resetOnSubmit = true;

	created()
	{
		this.formModel.topic_id = this.topic.id;

		if ( this.replyTo ) {
			this.formModel.reply_to = this.replyTo.id;  // Post ID.
		}
	}

	onCancel()
	{
		this.$emit( 'cancel' );
	}
}
