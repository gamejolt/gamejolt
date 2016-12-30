import { Injectable, Inject } from 'ng-metadata/core';
import { App } from '../../../../app-service';
import { Fireside_Post } from '../../../../../lib/gj-lib-client/components/fireside/post/post-model';

@Injectable()
export class ViewCtrl
{
	tag: string;
	posts: Fireside_Post[];

	constructor(
		@Inject( '$stateParams' ) $stateParams: ng.ui.IStateParamsService,
		@Inject( 'App' ) app: App,
		@Inject( 'Fireside_Post' ) postModel: typeof Fireside_Post,
		@Inject( 'payload' ) payload: any,
	)
	{
		this.tag = $stateParams['tag'];
		app.title = 'Articles tagged #' + this.tag;

		if ( payload.posts ) {
			this.posts = postModel.populate( payload.posts );
		}
		else {
			this.posts = [];
		}
	}
}
