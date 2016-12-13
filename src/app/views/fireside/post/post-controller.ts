import { Injectable, Inject } from 'ng-metadata/core';
import { App } from './../../../app-service';
import { Fireside_Post } from './../../../../lib/gj-lib-client/components/fireside/post/post-model';

@Injectable()
export class PostCtrl
{
	post: Fireside_Post;

	constructor(
		@Inject( 'App' ) app: App,
		@Inject( 'Fireside_Post' ) postModel: typeof Fireside_Post,
		@Inject( 'payload' ) payload: any,
	)
	{
		this.post = new postModel( payload.post );
		app.title = this.post.title;
	}
}
