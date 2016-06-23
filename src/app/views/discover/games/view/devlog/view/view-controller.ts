import { Injectable, Inject } from 'ng-metadata/core';
import { Fireside_Post } from './../../../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { App } from './../../../../../../app-service';

@Injectable()
export class ViewCtrl
{
	post: Fireside_Post = null;

	constructor(
		@Inject( '$scope' ) $scope: ng.IScope,
		@Inject( 'App' ) App: App,
		@Inject( 'Fireside_Post' ) firesidePost: typeof Fireside_Post,
		@Inject( 'payload' ) payload: any
	)
	{
		// Meta.description = 'View all the latest devlog posts for ' + $scope.gameCtrl.game.title + ' on Game Jolt';

		this.post = new firesidePost( payload.post );

		App.title = this.post.title;
	}
}
