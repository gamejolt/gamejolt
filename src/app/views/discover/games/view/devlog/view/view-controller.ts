import { Injectable, Inject } from 'ng-metadata/core';
import { FiresidePost } from '../../../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { App } from '../../../../../../app-service';
import { Meta } from '../../../../../../../lib/gj-lib-client/components/meta/meta-service';
import { Location } from '../../../../../../../lib/gj-lib-client/components/location/location-service';

@Injectable()
export class ViewCtrl
{
	post: FiresidePost;

	constructor(
		@Inject( '$scope' ) $scope: ng.IScope,
		@Inject( 'App' ) app: App,
		@Inject( 'Meta' ) meta: Meta,
		@Inject( 'Fireside_Post' ) firesidePostModel: typeof FiresidePost,
		@Inject( 'payload' ) payload: any,
		@Inject( 'Location' ) location: Location,
	)
	{
		this.post = new firesidePostModel( payload.post );
		this.post.$viewed();
		this.post.$expanded();

		location.enforce( {
			slug: $scope['gameCtrl'].game.slug,
			postSlug: this.post.slug,
		} );

		app.title = this.post.title;
		meta.description = payload.metaDescription;
		meta.fb = payload.fb;
		meta.twitter = payload.twitter;
	}
}
