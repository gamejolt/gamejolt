import { Injectable, Inject } from 'ng-metadata/core';
import { App } from './../../../../../../../app-service';
import { Fireside_Post } from '../../../../../../../../lib/gj-lib-client/components/fireside/post/post-model';

@Injectable()
export class ListCtrl
{
	posts: Fireside_Post[];
	showNewPost: string = null;

	constructor(
		@Inject( '$scope' ) $scope: ng.IScope,
		@Inject( '$stateParams' ) $stateParams: ng.ui.IStateParamsService,
		@Inject( 'App' ) app: App,
		@Inject( 'Fireside_Post' ) private firesidePost: typeof Fireside_Post,
		@Inject( 'gettextCatalog' ) gettextCatalog: ng.gettext.gettextCatalog,
		@Inject( 'payload' ) payload: any
	)
	{
		app.title = gettextCatalog.getString( 'Manage Devlog' );

		this.posts = firesidePost.populate( payload.posts );
	}

	onPostAdded( post: Fireside_Post )
	{
		if ( post.status == this.firesidePost.STATUS_ACTIVE ) {
			this.posts.unshift( post );
		}
	}

	onPostRemoved( post: Fireside_Post )
	{
		window._.remove( this.posts, { id: post.id } );
	}
}
