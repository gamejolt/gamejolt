import { Injectable, Inject } from 'ng-metadata/core';
import { App } from './../../../../../../../app-service';
import { FormDashboardGameWizard } from './../../../../../../../components/forms/dashboard/game/wizard/wizard-service';

@Injectable()
export class MaturityCtrl
{
	constructor(
		@Inject( 'App' ) app: App,
		@Inject( '$scope' ) private $scope: angular.IScope,
		@Inject( 'Scroll' ) private scroll: any,
		@Inject( 'Growls' ) private growls: any,
		@Inject( 'FormDashboardGameWizard' ) private wizard: FormDashboardGameWizard,
		@Inject( 'gettextCatalog' ) private gettextCatalog: angular.gettext.gettextCatalog
	)
	{
		app.title = gettextCatalog.getString( 'dash.games.maturity.page_title', { game: $scope['manageCtrl'].game.title } );
	}

	onSaved()
	{
		if ( this.$scope['manageCtrl'].isWizard ) {
			this.wizard.goNext();
			return;
		}

		this.growls.success(
			this.gettextCatalog.getString( 'dash.games.maturity.saved_growl' ),
			this.gettextCatalog.getString( 'dash.games.maturity.saved_growl_title' )
		);
		this.scroll.to( 0 );
	}
}
