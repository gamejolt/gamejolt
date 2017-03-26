import Vue from 'vue';
import { ActivityFeedItem, ActivityFeedInput } from './item-service';
import { FiresidePost } from '../../../../lib/gj-lib-client/components/fireside/post/post-model';

export class ActivityFeedContainer
{
	items: ActivityFeedItem[] = [];
	games: { [k: string]: any } = {};

	viewedItems: string[] = [];
	expandedItems: string[] = [];
	notificationWatermark = 0;  // Timestamp.
	reachedEnd = false;

	private _activeItem: ActivityFeedItem | null = null;
	private _scroll = 0;

	get hasItems()
	{
		return this.items.length > 0;
	}

	constructor( items: ActivityFeedInput[], notificationWatermark?: number )
	{
		this.append( items );

		if ( typeof notificationWatermark !== 'undefined' ) {
			this.notificationWatermark = notificationWatermark;
		}
	}

	prepend( _items: ActivityFeedInput[] )
	{
		const items = _items.map( item => new ActivityFeedItem( item ) );
		this.items = items.concat( this.items );
		this._processGames();
	}

	append( _items: ActivityFeedInput[] )
	{
		const items = _items.map( item => new ActivityFeedItem( item ) );
		this.items = this.items.concat( items );
		this._processGames();
	}

	update( _item: ActivityFeedInput )
	{
		const item = new ActivityFeedItem( _item );
		const index = this.items.findIndex( ( i ) =>
		{
			return i.type === item.type && i.feedItem.id === item.feedItem.id;
		} );

		if ( index >= 0 ) {
			Vue.set( this.items, index, item );
		}

		this._processGames();
	}

	remove( _item: ActivityFeedInput )
	{
		const item = new ActivityFeedItem( _item );
		const index = this.items.findIndex( ( i ) =>
		{
			return i.type === item.type && i.feedItem.id === item.feedItem.id;
		} );

		this.items.splice( index, 1 );

		this._processGames();
	}

	setActive( active: ActivityFeedItem | null )
	{
		this._activeItem = active;
	}

	getActive()
	{
		return this._activeItem;
	}

	setScroll( scroll: number )
	{
		this._scroll = scroll;
	}

	getScroll()
	{
		return this._scroll;
	}

	viewed( item: ActivityFeedItem )
	{
		if ( this.viewedItems.indexOf( item.id ) !== -1 ) {
			return;
		}

		this.viewedItems.push( item.id );

		if ( item.type === 'devlog-post' ) {
			const feedItem = <FiresidePost>item.feedItem;
			feedItem.$viewed();
		}
	}

	expanded( item: ActivityFeedItem )
	{
		if ( this.expandedItems.indexOf( item.id ) !== -1 ) {
			return;
		}

		this.expandedItems.push( item.id );

		if ( item.type === 'devlog-post' ) {
			const feedItem = <FiresidePost>item.feedItem;
			feedItem.$expanded();
		}
	}

	/**
	 * This ensures that any reference to a particular game any of the feed items
	 * are shared across all items. It not only reduces mem usage, but also helps
	 * to keep things in sync (game follows, etc).
	 */
	private _processGames()
	{
		for ( const item of this.items ) {
			if ( item.feedItem instanceof FiresidePost ) {
				if ( !this.games[ item.feedItem.game.id ] ) {
					Vue.set( this.games, item.feedItem.game.id, item.feedItem.game );
				}
				else {
					Vue.set( item.feedItem, 'game', this.games[ item.feedItem.game.id ] );
				}
			}
		}
	}
}
