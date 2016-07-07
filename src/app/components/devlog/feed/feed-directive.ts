import { Component, Input, Output, Inject } from 'ng-metadata/core';
import { Fireside_Post } from './../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { DevlogFeedService } from './feed-service';

@Component({
	selector: 'gj-devlog-feed',
	templateUrl: '/app/components/devlog/feed/feed.html',
})
export class FeedComponent
{
	// Store our own posts so that we can update within this component
	// without modifying the outside.
	private _posts: Fireside_Post[];
	private _inView: number[] = [];

	@Input( '<devlogPosts' ) posts: Fireside_Post[];

	@Output( '?onPostRemoved' ) private _onPostRemoved: Function;
	@Output( '?onPostEdited' ) private _onPostEdited: Function;
	@Output( '?onPostPublished' ) private _onPostPublished: Function;

	constructor(
		@Inject( '$scope' ) $scope: ng.IScope,
		@Inject( '$location' ) private $location: ng.ILocationService,
		@Inject( '$document' ) private $document: ng.IDocumentService,
		@Inject( '$timeout' ) private $timeout: ng.ITimeoutService,
		@Inject( 'Scroll' ) private scroll: any,
		@Inject( 'DevlogFeedService' ) private feedService: DevlogFeedService,
		@Inject( 'Fireside_Post' ) private firesidePost: typeof Fireside_Post
	)
	{
		// Keep our post list in sync with parent.
		$scope.$watchCollection( () => this.posts, ( newVal, oldVal ) =>
		{
			this._posts = (this.posts || []).map( item => item );

			// First time getting posts in.
			if ( this._posts.length && typeof oldVal === 'undefined' ) {
				this._scrollActive();
			}
		} );
	}

	private _scrollActive()
	{
		const active = this.feedService.getActive();
		if ( active ) {
			this.$timeout( () =>
			{
				const id = `devlog-feed-post-${active}`;
				if ( this.$document[0].getElementById( id ) ) {
					this.scroll.to( id );
				}
			}, 200, false );
		}
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

	onPostPublished( post: Fireside_Post )
	{
		if ( this._onPostPublished ) {
			this._onPostPublished( { $post: post } );
		}
	}

	onPostRemoved( post: Fireside_Post )
	{
		if ( this._onPostRemoved ) {
			this._onPostRemoved( { $post: post } );
		}
	}

	onPostInViewChange( visible: boolean, post: Fireside_Post )
	{
		if ( visible ) {
			this._inView.push( post.id );
			this._inView = _.uniq( this._inView );
			this.feedService.setActive( post.id );
		}
		else {
			_.pull( this._inView, post.id );
		}

		if ( !this._inView.length ) {
			this.feedService.setActive( null );
		}
	}
}
