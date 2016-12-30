import { Injectable, Inject } from 'ng-metadata/core';
import { Fireside_Post } from '../../../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { Meta } from '../../../../../../../lib/gj-lib-client/components/meta/meta-service';

@Injectable()
export class ListCtrl
{
	posts: Fireside_Post[];
	commentCounts: any;

	isShowingAddInput = false;
	newPostTitle = '';

	constructor(
		@Inject( 'Meta' ) meta: Meta,
		@Inject( '$state' ) private $state: ng.ui.IStateService,
		@Inject( 'Fireside_Post' ) public postModel: typeof Fireside_Post,
		@Inject( 'payload' ) payload: any,
	)
	{
		meta.title = 'Your Posts';

		this.posts = postModel.populate( payload.posts );
		this.commentCounts = payload.commentCounts;
	}

	onNewPostKeypress( $event: KeyboardEvent )
	{
		// ESC
		if ( $event.keyCode == 27 ) {
			this.isShowingAddInput = false;
			this.newPostTitle = '';
		}

		// Enter
		if ( $event.keyCode == 13 ) {

			const post = new this.postModel( {
				title: this.newPostTitle,
			} );

			post.$save().then( () =>
			{
				this.$state.go( 'dashboard.main.fireside.posts.edit', { postId: post.id } );
			} );
		}
	};
}
