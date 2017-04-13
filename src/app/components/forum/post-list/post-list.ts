import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./post-list.html';

import { ForumPost } from '../../../../lib/gj-lib-client/components/forum/post/post.model';
import { ForumTopic } from '../../../../lib/gj-lib-client/components/forum/topic/topic.model';
import { AppForumPostListItem } from './item/item';
import { AppMessageThread } from '../../../../lib/gj-lib-client/components/message-thread/message-thread';

@View
@Component({
	components: {
		AppMessageThread,
		AppForumPostListItem,
	},
})
export class AppForumPostList extends Vue
{
	@Prop( ForumTopic ) topic: ForumTopic;
	@Prop( Array ) posts: ForumPost[];

	// No longer showing this.
	@Prop( Object ) userPostCounts: any;

	// onReplied( parent: ForumPost, newPost: ForumPost )
	// {
	// 	// If the replies list is open, we add it at the bottom of the replies list as well.
	// 	// Otherwise we let the caller of the post-list handle the new reply.
	// 	if ( this.showingReplies[ parent.id ] ) {
	// 		this.loadReplies( parent );
	// 	}

	// 	this.$emit( 'replied', newPost );

	// 	// // Hand it off to whatever called the post-list directive.
	// 	// if ( this.onReply ) {
	// 	// 	this.onReply( { formModel: formModel, $response: response } );
	// 	// }
	// }
}
