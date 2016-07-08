import { Injectable, Inject } from 'ng-metadata/core';
import { Fireside_Post } from './../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { Notification } from './../../../../lib/gj-lib-client/components/notification/notification-model';

export type ActivityFeedModels = Notification | Fireside_Post;

@Injectable()
export class ActivityFeedService
{
	private _items: ActivityFeedModels[] = [];
	private _activeId: number = null;

	bootstrap( posts: ActivityFeedModels[] )
	{
		this.store( posts );
		this._activeId = null;
		return this._items;
	}

	store( posts: ActivityFeedModels[] )
	{
		this._items = posts;
	}

	fetch()
	{
		return this._items;
	}

	setActive( active: number )
	{
		this._activeId = active;
	}

	getActive()
	{
		return this._activeId;
	}
}
