import { Injectable, Inject } from 'ng-metadata/core';
import { App } from './../../../../../../../app-service';

@Injectable()
export class HeaderCtrl
{
	constructor(
		@Inject( 'App' ) app: App,
		@Inject( '$scope' ) private $scope: angular.IScope,
		@Inject( 'Popover' ) private popover: any,
		@Inject( 'Scroll' ) private scroll: any,
		@Inject( 'Growls' ) private growls: any,
		@Inject( 'gettextCatalog' ) private gettextCatalog: angular.gettext.gettextCatalog
	)
	{
		app.title = gettextCatalog.getString( 'dash.games.header.page_title', { game: $scope['manageCtrl'].game.title } );
	}

	clearHeader()
	{
		this.popover.hideAll();
		this.$scope['manageCtrl'].game.$clearHeader();
	}

	onSaved()
	{
		this.growls.success(
			this.gettextCatalog.getString( 'dash.games.header.saved_growl' ),
			this.gettextCatalog.getString( 'dash.games.header.saved_growl_title' )
		);
		this.scroll.to( 0 );
	}
}
