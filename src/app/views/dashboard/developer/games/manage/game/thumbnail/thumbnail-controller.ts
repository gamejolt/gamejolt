import { Injectable, Inject } from 'ng-metadata/core';
import { App } from './../../../../../../../app-service';

@Injectable()
export class ThumbnailCtrl
{
	constructor(
		@Inject( 'App' ) app: App,
		@Inject( '$scope' ) $scope: ng.IScope,
		@Inject( 'Scroll' ) private scroll: any,
		@Inject( 'Growls' ) private growls: any,
		@Inject( 'gettextCatalog' ) private gettextCatalog: ng.gettext.gettextCatalog
	)
	{
		app.title = gettextCatalog.getString( 'dash.games.thumbnail.page_title', { game: $scope['manageCtrl'].game.title } );
	}

	onSaved()
	{
		this.growls.success(
			this.gettextCatalog.getString( 'dash.games.thumbnail.saved_growl' ),
			this.gettextCatalog.getString( 'dash.games.thumbnail.saved_growl_title' )
		);
		this.scroll.to( 0 );
	}
}
