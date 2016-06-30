import { Injectable, Inject } from 'ng-metadata/core';
import { App } from './../../../../../../../app-service';
import { Fireside_Post } from '../../../../../../../../lib/gj-lib-client/components/fireside/post/post-model';

@Injectable()
export class EditCtrl
{
	post: Fireside_Post;

	constructor(
		@Inject( '$scope' ) $scope: ng.IScope,
		@Inject( '$stateParams' ) $stateParams: ng.ui.IStateParamsService,
		@Inject( 'App' ) app: App,
		@Inject( 'Fireside_Post' ) private firesidePost: typeof Fireside_Post,
		@Inject( 'gettextCatalog' ) gettextCatalog: ng.gettext.gettextCatalog,
		@Inject( 'payload' ) payload: any
	)
	{
		app.title = gettextCatalog.getString( 'Edit Post' );
		this.post = new firesidePost( payload.post );
	}
}
