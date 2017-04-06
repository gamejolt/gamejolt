import { Injectable, Inject } from 'ng-metadata/core';
import { App } from './../../../../../../app-service';
import { Fireside_Post } from '../../../../../../../lib/gj-lib-client/components/fireside/post/post-model';

@Injectable()
export class DevlogCtrl
{
	constructor(
		@Inject( '$scope' ) private $scope: ng.IScope,
		@Inject( 'App' ) app: App,
		@Inject( 'gettextCatalog' ) gettextCatalog: ng.gettext.gettextCatalog,
	)
	{
		app.title = gettextCatalog.getString( 'Manage Devlog' );
	}

	onPostAdded( post: Fireside_Post )
	{
		this.$scope.$broadcast( 'Devlog.postAdded', post );
	}
}
