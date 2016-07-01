import { Component, Input, Output, Inject } from 'ng-metadata/core';
import { Fireside_Post } from './../../../../lib/gj-lib-client/components/fireside/post/post-model';

@Component({
	selector: 'gj-devlog-feed',
	templateUrl: '/app/components/devlog/feed/feed.html',
})
export class FeedComponent
{
	// Store our own posts so that we can update within this component
	// without modifying the outside.
	private _posts: Fireside_Post[];

	@Input( '<devlogPosts' ) posts: Fireside_Post[];

	@Output( '?onPostRemoved' ) private _onPostRemoved: Function;
	@Output( '?onPostEdited' ) private _onPostEdited: Function;

	constructor(
		@Inject( '$scope' ) $scope: ng.IScope,
		@Inject( 'Fireside_Post' ) private firesidePost: typeof Fireside_Post
	)
	{
		// Keep our post list in sync with parent.
		$scope.$watchCollection( _ => this.posts, _ =>
		{
			this._posts = this.posts.map( item => item );
		} );
	}

	onPostEdited( post: Fireside_Post )
	{
		// This should let our ng-repeat know that the post was modified.
		// It shouldn't actually change the post since we're just filling the same values.
		const index = _.findIndex( this._posts, { id: post.id } );
		if ( index >= 0 ) {
			this._posts[ index ] = new this.firesidePost( post );
		}

		if ( this._onPostEdited ) {
			this._onPostEdited( { $post: post } );
		}
	}

	onPostRemoved( post: Fireside_Post )
	{
		if ( this._onPostRemoved ) {
			this._onPostRemoved( { $post: post } );
		}
	}
}
