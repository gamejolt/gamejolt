import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./post.html';

import { ForumPost } from '../../../../../lib/gj-lib-client/components/forum/post/post.model';
import { FormCommonComponents } from '../../../../../lib/gj-lib-client/components/form-vue/form';
import { BaseForm } from '../../../../../lib/gj-lib-client/components/form-vue/form.service';
import { ForumTopic } from '../../../../../lib/gj-lib-client/components/forum/topic/topic.model';

@View
@Component({
	components: {
		...FormCommonComponents,
	},
})
export class FormForumPost extends BaseForm
{
	@Prop( ForumTopic ) topic: ForumTopic;
	@Prop( ForumPost ) replyTo?: ForumPost;

	formModel: ForumPost;

	modelClass = ForumPost;
	// resetOnSubmit: true,

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
