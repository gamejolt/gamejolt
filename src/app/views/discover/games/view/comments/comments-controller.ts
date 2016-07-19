import { Injectable, Inject } from 'ng-metadata/core';
import { App } from './../../../../../app-service';

@Injectable()
export class CommentsCtrl
{
	constructor(
		@Inject( 'App' ) app: App,
		@Inject( '$scope' ) $scope: ng.IScope,
		@Inject( 'gettextCatalog' ) gettextCatalog: ng.gettext.gettextCatalog
	)
	{
		app.title = gettextCatalog.getString( 'Comments for {{ game }}', { game: $scope['gameCtrl'].game.title } );
	}
}
