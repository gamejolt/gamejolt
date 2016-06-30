import { Injectable, Inject } from 'ng-metadata/core';
import { App } from './../../../../app-service';
import { Fireside_Post } from './../../../../../lib/gj-lib-client/components/fireside/post/post-model';

@Injectable()
export class OverviewCtrl
{
	games: any[];
	posts: Fireside_Post[];

	constructor(
		@Inject( '$stateParams' ) $stateParams: ng.ui.IStateParamsService,
		@Inject( 'App' ) app: App,
		@Inject( 'Game' ) game: any,
		@Inject( 'Fireside_Post' ) firesidePost: typeof Fireside_Post,
		@Inject( 'payload' ) payload: any
	)
	{
		this.games = game.populate( payload.games );
		this.posts = firesidePost.populate( payload.posts );
	}
}
