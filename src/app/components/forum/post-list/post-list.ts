import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./post-list.html?style=./post-list.styl';
import '../../timeline-list/timeline-list.styl';

import { ForumPost } from '../../../../lib/gj-lib-client/components/forum/post/post.model';
import { ForumTopic } from '../../../../lib/gj-lib-client/components/forum/topic/topic.model';
import { Api } from '../../../../lib/gj-lib-client/components/api/api.service';
import { Growls } from '../../../../lib/gj-lib-client/components/growls/growls.service';
import { AppForumPostListItem } from './item/item';

@View
@Component({
	components: {
		AppForumPostListItem,
	},
})
export class AppForumPostList extends Vue
{
	@Prop( ForumTopic ) topic: ForumTopic;
	@Prop( Array ) posts: ForumPost[];
	@Prop( Object ) userPostCounts: any;

	showingReplies: { [k: number]: boolean } = {};
	replies: { [k: number]: ForumPost[] } = {};
	replyCounts: { [k: number]: number } = {};

	toggleReplies( post: ForumPost )
	{
		if ( this.showingReplies[ post.id ] ) {
			this.showingReplies[ post.id ] = false;
			return;
		}

		Vue.set( this.showingReplies as any, post.id, true );
		this.loadReplies( post );
	}

	onReplied( parent: ForumPost, newPost: ForumPost )
	{
		// If the replies list is open, we add it at the bottom of the replies list as well.
		// Otherwise we let the caller of the post-list handle the new reply.
		if ( this.showingReplies[ parent.id ] ) {
			this.loadReplies( parent );
		}

		this.$emit( 'replied', newPost );

		// // Hand it off to whatever called the post-list directive.
		// if ( this.onReply ) {
		// 	this.onReply( { formModel: formModel, $response: response } );
		// }
	}

	async loadReplies( post: ForumPost )
	{
		try {
			const payload = await Api.sendRequest( '/web/forums/posts/replies/' + post.id, { noErrorRedirect: true } );

			Vue.set( this.replies as any, post.id, ForumPost.populate( payload.replies ) );
			Vue.set( this.replyCounts as any, post.id, payload.repliesCount || 0 );

			// TODO: Is this only pulling for replies? Maybe we need to merge?
			// this.userPostCounts = payload.userPostCounts || {};

			if ( !this.showingReplies[ post.id ] ) {
				this.showingReplies[ post.id ] = true;
			}
		}
		catch ( e ) {
			Growls.error(
				this.$gettext( `Couldn't load replies for some reason.` ),
				this.$gettext( `Loading Failed` ),
			);
		}
	}
}
