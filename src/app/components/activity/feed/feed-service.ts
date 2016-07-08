import { Injectable } from 'ng-metadata/core';
import { ActivityFeedItem } from './item-service';

@Injectable()
export class ActivityFeedService
{
	private _items: ActivityFeedItem[] = [];
	private _activeId: string = null;

	bootstrap( posts: ActivityFeedItem[] )
	{
		this.store( posts );
		this._activeId = null;
		return this._items;
	}

	store( posts: ActivityFeedItem[] )
	{
		this._items = posts;
	}

	fetch()
	{
		return this._items;
	}

	setActive( active: string )
	{
		this._activeId = active;
	}

	getActive()
	{
		return this._activeId;
	}
}
