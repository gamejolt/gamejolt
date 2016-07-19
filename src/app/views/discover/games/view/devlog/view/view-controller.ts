import { Injectable, Inject } from 'ng-metadata/core';
import { Fireside_Post } from './../../../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { App } from './../../../../../../app-service';

@Injectable()
export class ViewCtrl
{
	post: Fireside_Post;

	constructor(
		@Inject( 'App' ) app: App,
		@Inject( 'Fireside_Post' ) firesidePostModel: typeof Fireside_Post,
		@Inject( 'payload' ) payload: any
	)
	{
		this.post = new firesidePostModel( payload.post );
		this.post.$viewed();
		this.post.$expanded();

		app.title = this.post.title;
	}
}
