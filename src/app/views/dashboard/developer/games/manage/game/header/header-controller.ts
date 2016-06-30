import { Injectable, Inject } from 'ng-metadata/core';
import { App } from './../../../../../../../app-service';
import { FormDashboardGameWizard } from './../../../../../../../components/forms/dashboard/game/wizard/wizard-service';

@Injectable()
export class HeaderCtrl
{
	constructor(
		@Inject( 'App' ) app: App,
		@Inject( '$scope' ) private $scope: ng.IScope,
		@Inject( 'Popover' ) private popover: any,
		@Inject( 'Scroll' ) private scroll: any,
		@Inject( 'Growls' ) private growls: any,
		@Inject( 'FormDashboardGameWizard' ) private wizard: FormDashboardGameWizard,
		@Inject( 'gettextCatalog' ) private gettextCatalog: ng.gettext.gettextCatalog
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
