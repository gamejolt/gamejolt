import { Injectable, Inject } from 'ng-metadata/core';
import { App } from './../../../app-service';
import { Fireside_Post } from './../../../../lib/gj-lib-client/components/fireside/post/post-model';

@Injectable()
export class HomeCtrl
{
	latestPosts: Fireside_Post[];
	pagination: any;

	constructor(
		@Inject( 'App' ) app: App,
		@Inject( 'Fireside_Post' ) postModel: typeof Fireside_Post,
		@Inject( 'payload' ) payload: any,
	)
	{
		app.title = 'Indie game news, reviews, and opinions by people';

		this.latestPosts = postModel.populate( payload.latestPosts );
		this.pagination = payload.pagination;
	}
}
