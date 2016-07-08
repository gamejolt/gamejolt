import { Component, Inject, Input, Output } from 'ng-metadata/core';
import { Fireside_Post } from './../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { Notification } from './../../../../lib/gj-lib-client/components/notification/notification-model';
import { ActivityFeedService, ActivityFeedModels } from './feed-service';
import template from './feed.html';

@Component({
	selector: 'gj-activity-feed',
	template,
})
export class FeedComponent
{
	// Store our own items so that we can update within this component
	// without modifying the outside.
	private _items: ActivityFeedModels[];
	private _inView: number[] = [];

	@Input( '<' ) items: ActivityFeedModels[];

	@Output( '?onPostRemoved' ) private _onPostRemoved: Function;
	@Output( '?onPostEdited' ) private _onPostEdited: Function;
	@Output( '?onPostPublished' ) private _onPostPublished: Function;

	constructor(
		@Inject( '$scope' ) $scope: ng.IScope,
		@Inject( '$location' ) private $location: ng.ILocationService,
		@Inject( '$document' ) private $document: ng.IDocumentService,
		@Inject( '$timeout' ) private $timeout: ng.ITimeoutService,
		@Inject( 'Scroll' ) private scroll: any,
		@Inject( 'ActivityFeedService' ) private feedService: ActivityFeedService,
		@Inject( 'Fireside_Post' ) private firesidePost: typeof Fireside_Post
	)
	{
		// Keep our post list in sync with parent.
		$scope.$watchCollection( () => this.items, ( newVal, oldVal ) =>
		{
			this._items = (this.items || []).map( item => item );

			// First time getting items in.
			// Let's try scolling to a possible active one.
			// This will happen if they click away and back to the feed.
			if ( this._items.length && typeof oldVal === 'undefined' ) {
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
				const id = `activity-feed-item-${active}`;
				if ( this.$document[0].getElementById( id ) ) {
					this.scroll.to( id );
				}
			}, 200, false );
		}
	}

	setActive( active: number )
	{
		this.feedService.setActive( active );
	}

	onPostEdited( post: Fireside_Post )
	{
		// This should let our ng-repeat know that the post was modified.
		// It shouldn't actually change the post since we're just filling the same values.
		const index = _.findIndex( this._items, { id: post.id } );
		if ( index >= 0 ) {
			this._items[ index ] = new this.firesidePost( post );
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

	onItemInViewChange( visible: boolean, item: ActivityFeedModels )
	{
		if ( visible ) {
			this._inView.push( item.id );
			this._inView = _.uniq( this._inView );
			this.feedService.setActive( item.id );
		}
		else {
			_.pull( this._inView, item.id );
		}

		if ( !this._inView.length ) {
			this.feedService.setActive( null );
		}
	}
}
