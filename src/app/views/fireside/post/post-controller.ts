import { Injectable, Inject } from 'ng-metadata/core';
import { App } from './../../../app-service';
import { Fireside_Post } from './../../../../lib/gj-lib-client/components/fireside/post/post-model';
// import { Fireside_Post_Like } from './../../../../lib/gj-lib-client/components/fireside/post/like/like-model';

@Injectable()
export class PostCtrl
{
	post: Fireside_Post;

	constructor(
		@Inject( 'App' ) app: App,
		@Inject( 'Fireside_Post' ) postModel: typeof Fireside_Post,
		// @Inject( 'Fireside_Post_Like' ) likeModel: typeof Fireside_Post_Like,
		@Inject( 'Analytics' ) analytics: any,
		@Inject( 'payload' ) payload: any,
	)
	{
		this.post = new postModel( payload.post );
		app.title = this.post.title;

		console.log( this.post );

		// this.likes = Fireside_Post_Like.populate( payload.likes );
		// this.likesCount = payload.likesCount;

		// if ( payload.userLike ) {
		// 	this.userLike = new Fireside_Post_Like( payload.userLike );
		// }

		if ( this.post.user.fireside_ga_tracking_id ) {
			analytics.trackPageview( null, this.post.user.fireside_ga_tracking_id );
		}
	}
}
