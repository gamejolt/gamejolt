import { Injectable, Inject } from 'ng-metadata/core';
import { App } from './../../../../../../../app-service';
import { Fireside_Post } from '../../../../../../../../lib/gj-lib-client/components/fireside/post/post-model';

@Injectable()
export class ListCtrl
{
	posts: Fireside_Post[];
	draftPosts: Fireside_Post[];
	showNewPost: string = null;
	tab: 'active' | 'draft' = 'active';

	constructor(
		@Inject( '$scope' ) $scope: ng.IScope,
		@Inject( '$stateParams' ) $stateParams: ng.ui.IStateParamsService,
		@Inject( 'App' ) app: App,
		@Inject( 'Fireside_Post' ) private firesidePostModel: typeof Fireside_Post,
		@Inject( 'gettextCatalog' ) gettextCatalog: ng.gettext.gettextCatalog,
		@Inject( 'payload' ) payload: any
	)
	{
		app.title = gettextCatalog.getString( 'Manage Devlog' );

		this.posts = firesidePostModel.populate( payload.posts );
		this.draftPosts = firesidePostModel.populate( payload.draftPosts );
	}

	onPostAdded( post: Fireside_Post )
	{
		if ( post.status == this.firesidePostModel.STATUS_ACTIVE ) {
			this.posts.unshift( post );
		}
		else if ( post.status == this.firesidePostModel.STATUS_DRAFT ) {
			this.draftPosts.unshift( post );
		}
	}

	onPostPublished( post: Fireside_Post )
	{
		this.posts.unshift( post );
		window._.remove( this.draftPosts, { id: post.id } );
		this.tab = 'active';
	}

	onPostRemoved( post: Fireside_Post )
	{
		window._.remove( this.posts, { id: post.id } );
		window._.remove( this.draftPosts, { id: post.id } );
	}
}
