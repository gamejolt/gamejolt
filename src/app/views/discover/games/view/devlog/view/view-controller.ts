import { Injectable, Inject } from 'ng-metadata/core';
import { Fireside_Post } from './../../../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { App } from './../../../../../../app-service';
import { Location } from './../../../../../../../lib/gj-lib-client/components/location/location-service';

@Injectable()
export class ViewCtrl
{
	post: Fireside_Post;

	constructor(
		@Inject( '$scope' ) $scope: ng.IScope,
		@Inject( 'App' ) app: App,
		@Inject( 'Fireside_Post' ) firesidePostModel: typeof Fireside_Post,
		@Inject( 'payload' ) payload: any,
		@Inject( 'Location' ) location: Location,
	)
	{
		this.post = new firesidePostModel( payload.post );
		this.post.$viewed();
		this.post.$expanded();

		app.title = this.post.title;

		location.enforce( {
			slug: $scope['gameCtrl'].game.slug,
			postSlug: this.post.slug,
		} );
	}
}
