import { Injectable, Inject } from 'ng-metadata/core';
import { App } from './../../../../../../../app-service';

@Injectable()
export class AddCtrl
{
	constructor(
		@Inject( '$state' ) private $state: angular.ui.IStateService,
		@Inject( 'App' ) app: App,
		@Inject( 'Growls' ) private growls: any,
		@Inject( 'gettextCatalog' ) gettextCatalog: ng.gettext.gettextCatalog
	)
	{
		app.title = gettextCatalog.getString( 'Add Devlog Post' );
	}

	onSubmitted()
	{
		this.growls.success(
			// gettextCatalog.getString( 'dash.games.news.add.added_growl' ),
			// gettextCatalog.getString( 'dash.games.news.add.added_growl_title' )
		);
		this.$state.go( '^.list' );
	}
}

