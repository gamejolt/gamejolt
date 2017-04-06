import { Injectable, Inject } from 'ng-metadata/core';
import { App } from './../../../app-service';
import { Meta } from './../../../../lib/gj-lib-client/components/meta/meta-service';
import { Fireside_Post } from './../../../../lib/gj-lib-client/components/fireside/post/post-model';

@Injectable()
export class MarketplaceCtrl
{
	firesidePosts: Fireside_Post[];
	games: any[];

	constructor(
		@Inject( 'App' ) app: App,
		@Inject( 'Meta' ) meta: Meta,
		@Inject( 'Game' ) gameModel: any,
		@Inject( 'Fireside_Post' ) postModel: typeof Fireside_Post,
		@Inject( 'payload' ) payload: any,

	)
	{
		app.title = 'Sell Your Games';

		meta.description = payload.metaDescription;
		meta.fb = payload.fb;
		meta.twitter = payload.twitter;
		meta.fb.image = meta.twitter.image = '/app/views/landing/marketplace/social.png';

		this.firesidePosts = postModel.populate( payload.firesidePosts );
		this.games = gameModel.populate( payload.games );
	}
}