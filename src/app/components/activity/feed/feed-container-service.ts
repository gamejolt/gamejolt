import { Injectable } from 'ng-metadata/core';
import { ActivityFeedItem, ActivityFeedInput } from './item-service';
import { Fireside_Post } from './../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { App } from './../../../app-service';

export function ActivityFeedContainerFactory( ActivityFeedItem: any, App: any )
{
	ActivityFeedContainer.itemModel = ActivityFeedItem;
	ActivityFeedContainer.app = App;
	return ActivityFeedContainer;
}

@Injectable()
export class ActivityFeedContainer
{
	static itemModel: typeof ActivityFeedItem;
	static app: App;

	items: ActivityFeedItem[] = [];
	hasItems = false;
	viewedItems: string[] = [];
	expandedItems: string[] = [];
	notificationWatermark?: number;  // Timestamp.
	reachedEnd = false;

	private _activeItem: ActivityFeedItem | undefined;
	private _scroll = 0;

	constructor( items: ActivityFeedInput[], notificationWatermark?: number )
	{
		this.append( items );

		if ( typeof notificationWatermark !== 'undefined' ) {
			this.notificationWatermark = notificationWatermark;
		}
	}

	prepend( _items: ActivityFeedInput[] )
	{
		const items = _items.map( item => new ActivityFeedContainer.itemModel( item ) );
		this.items = items.concat( this.items );
		this.hasItems = this.items.length > 0;
	}

	append( _items: ActivityFeedInput[] )
	{
		const items = _items.map( item => new ActivityFeedContainer.itemModel( item ) );
		this.items = this.items.concat( items );
		this.hasItems = this.items.length > 0;
	}

	update( _item: ActivityFeedInput )
	{
		const item = new ActivityFeedContainer.itemModel( _item );
		const index = _.findIndex( this.items, {
			type: item.type,
			feedItem: {
				id: item.feedItem.id,
			}
		} );

		if ( index >= 0 ) {
			this.items[ index ] = item;
		}
	}

	remove( _item: ActivityFeedInput )
	{
		const item = new ActivityFeedContainer.itemModel( _item );
		_.remove( this.items, {
			type: item.type,
			feedItem: {
				id: item.feedItem.id,
			}
		} );
		this.hasItems = this.items.length > 0;
	}

	setActive( active: ActivityFeedItem | undefined )
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
		if ( this.viewedItems.indexOf( item.id ) != -1 ) {
			return;
		}

		this.viewedItems.push( item.id );

		if ( item.type == 'devlog-post' ) {
			const feedItem = <Fireside_Post>item.feedItem;
			feedItem.$viewed();
		}
	}

	expanded( item: ActivityFeedItem )
	{
		if ( this.expandedItems.indexOf( item.id ) != -1 ) {
			return;
		}

		this.expandedItems.push( item.id );

		if ( item.type == 'devlog-post' ) {
			const feedItem = <Fireside_Post>item.feedItem;
			feedItem.$expanded();
		}
	}
}
