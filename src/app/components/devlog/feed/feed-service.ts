import { Injectable, Inject } from 'ng-metadata/core';
import { Fireside_Post } from './../../../../lib/gj-lib-client/components/fireside/post/post-model';

@Injectable()
export class DevlogFeedService
{
	private _posts: Fireside_Post[] = [];
	private _activePostId: number = null;

	constructor(
		@Inject( 'Fireside_Post' ) private firesidePostModel: typeof Fireside_Post
	)
	{
	}

	bootstrap( posts: Fireside_Post[] )
	{
		this.store( posts );
		this._activePostId = null;
		return this._posts;
	}

	store( posts: Fireside_Post[] )
	{
		this._posts = posts;
	}

	fetch()
	{
		return this._posts;
	}

	setActive( active: number )
	{
		this._activePostId = active;
	}

	getActive()
	{
		return this._activePostId;
	}
}
