import { Injectable, Inject } from 'ng-metadata/core';
import { App } from './../../../../../app-service';

@Injectable()
export class CommentsCtrl
{
	constructor(
		@Inject( 'App' ) app: App,
		@Inject( '$scope' ) $scope: angular.IScope,
		@Inject( 'gettextCatalog' ) gettextCatalog: angular.gettext.gettextCatalog
	)
	{
		app.title = gettextCatalog.getString( 'Comments for {{ game }}', { game: $scope['gameCtrl'].game.title } );
	}
}
