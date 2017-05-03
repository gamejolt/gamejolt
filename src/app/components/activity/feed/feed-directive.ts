import { Component, Inject, Input, Output, OnDestroy, AfterViewInit, EventEmitter } from 'ng-metadata/core';
import * as template from '!html-loader!./feed.html';

import { Notification } from '../../../../lib/gj-lib-client/components/notification/notification-model';
import { FiresidePost } from '../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { ActivityFeedItem } from './item-service';
import { ActivityFeedContainer } from './feed-container-service';
import { Api } from '../../../../lib/gj-lib-client/components/api/api.service';
import { Loader } from '../../../../lib/gj-lib-client/components/loader/loader.service';
import { Model } from '../../../../lib/gj-lib-client/components/model/model.service';
import { isPrerender } from '../../../../lib/gj-lib-client/components/environment/environment.service';
import { Game } from '../../../../lib/gj-lib-client/components/game/game.model';

/**
 * The number of items from the bottom that we should hit before loading more.
 */
const LOAD_MORE_FROM_BOTTOM = 5;

/**
 * The number of times we should do an auto-load of items before stopping
 * and requiring them to do it manually.
 */
const LOAD_MORE_TIMES = 3;

@Component({
	selector: 'gj-activity-feed',
	template,
})
export class ActivityFeedComponent implements OnDestroy, AfterViewInit
{
	@Input( '@' ) type: 'Notification' | 'Fireside_Post';
	@Input( '<items' ) feed: ActivityFeedContainer;
	@Input( '@' ) loadMoreUrl: string;
	@Input( '<' ) showEditControls = false;
	@Input( '<' ) showGameInfo = false;
	@Input( '<' ) showAds = false;
	@Input( '<' ) adResource?: Model;
	@Input( '<' ) disableAutoload = false;

	@Output( 'onPostRemoved' ) private _onPostRemoved = new EventEmitter<{ $post: FiresidePost }>();
	@Output( 'onPostEdited' ) private _onPostEdited = new EventEmitter<{ $post: FiresidePost }>();
	@Output( 'onPostPublished' ) private _onPostPublished = new EventEmitter<{ $post: FiresidePost }>();

	Loader = Loader;
	isLoadingMore = false;

	private _inView: { [k: string]: ActivityFeedItem } = {};
	private _timesLoaded = 0;

	/**
	 * Whether or not this feed was bootstrapped with previous data.
	 * This happens when you click the back button into a feed.
	 */
	wasHistorical: boolean;

	constructor(
		@Inject( '$scope' ) private $scope: ng.IScope,
		@Inject( '$timeout' ) private $timeout: ng.ITimeoutService,
		@Inject( 'Scroll' ) private scroll: any,
	)
	{
		Loader.load( 'hammer' );
		this.wasHistorical = !!this.feed.getActive();
	}

	ngAfterViewInit()
	{
		// Keep our post list in sync with parent.
		this.$scope.$watchCollection( () => this.feed.items || [], ( newVal, oldVal ) =>
		{
			this.$timeout( () =>
			{
				this.isLoadingMore = false;

				// First time getting items in.
				// Let's try scrolling to a possible active one.
				// This will happen if they click away and back to the feed.
				if ( newVal.length && newVal === oldVal ) {
					this._initScroll();
					this._initActive();
				}
			}, 200, false );
		} );
	}

	ngOnDestroy()
	{
		this.feed.setScroll( this.scroll.context.duScrollTop() );
	}

	private _initScroll()
	{
		const scroll = this.feed.getScroll();
		if ( scroll ) {
			this.scroll.to( scroll, { animate: false } );
		}
	}

	private _initActive()
	{
		const active = this.feed.getActive();
		if ( active ) {
			const id = `activity-feed-item-${active.id}`;
			const elem = window.document.getElementById( id );
			if ( elem ) {
				elem.classList.add( 'active' );
			}
		}
	}

	isItemUnread( item: ActivityFeedItem )
	{
		// Only care if there is a watermark.
		if ( typeof this.feed.notificationWatermark === 'undefined' ) {
			return false;
		}

		if ( item.feedItem instanceof Notification ) {
			return item.feedItem.added_on > this.feed.notificationWatermark;
		}
		else if ( item.feedItem instanceof FiresidePost ) {
			return item.feedItem.published_on > this.feed.notificationWatermark;
		}
	}

	isItemInView( item: ActivityFeedItem )
	{
		return !!this._inView[ item.id ];
	}

	setActive( item: ActivityFeedItem )
	{
		this.feed.setActive( item );
	}

	onPostEdited( post: FiresidePost )
	{
		this.feed.update( post );
		if ( this._onPostEdited ) {
			this._onPostEdited.emit( { $post: post } );
		}
	}

	onPostPublished( post: FiresidePost )
	{
		if ( this._onPostPublished ) {
			this._onPostPublished.emit( { $post: post } );
		}
	}

	onPostRemoved( post: FiresidePost )
	{
		this.feed.remove( post );
		if ( this._onPostRemoved ) {
			this._onPostRemoved.emit( { $post: post } );
		}
	}

	loadMore()
	{
		if ( this.isLoadingMore || this.feed.reachedEnd ) {
			return;
		}

		this.isLoadingMore = true;
		++this._timesLoaded;

		const lastPost = this.feed.items[ this.feed.items.length - 1 ];

		Api.sendRequest( this.loadMoreUrl, { scrollId: lastPost.scrollId } )
			.then( ( response: any ) =>
			{
				this.isLoadingMore = false;

				if ( !response.items || !response.items.length ) {
					this.feed.reachedEnd = true;
					return;
				}

				if ( this.type == 'Notification' ) {
					this.feed.append( Notification.populate( response.items ) );
				}
				else if ( this.type == 'Fireside_Post' ) {
					this.feed.append( FiresidePost.populate( response.items ) );
				}
			} );
	}

	onItemInViewChange( visible: boolean, item: ActivityFeedItem )
	{
		if ( visible ) {
			this._inView[ item.id ] = item;
			this.feed.viewed( item );

			// Auto-loading while scrolling.
			if ( !this.disableAutoload && !this.isLoadingMore && !this.feed.reachedEnd && this._timesLoaded < LOAD_MORE_TIMES ) {
				const index = _.findIndex( this.feed.items, { id: item.id } );
				if ( index >= this.feed.items.length - LOAD_MORE_FROM_BOTTOM ) {
					this.loadMore();
				}
			}
		}
		else {
			delete this._inView[ item.id ];
		}
	}

	onItemExpanded( item: ActivityFeedItem )
	{
		this.feed.expanded( item );
	}

	shouldShowAd( index: number )
	{
		if ( !this.showAds || isPrerender || GJ_IS_CLIENT ) {
			return false;
		}

		if ( this.adResource && this.adResource instanceof Game && !this.adResource._should_show_ads ) {
			return false;
		}

		index = index + 1;
		if ( index === 2 || index === 12 || index === 22 ) {
			return true;
		}

		return false;
	}
}
