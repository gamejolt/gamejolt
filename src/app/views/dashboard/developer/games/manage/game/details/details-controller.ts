import { Injectable, Inject } from 'ng-metadata/core';
import { App } from './../../../../../../../app-service';
import { FormDashboardGameWizard } from './../../../../../../../components/forms/dashboard/game/wizard/wizard-service';

@Injectable()
export class DetailsCtrl
{
	constructor(
		@Inject( 'App' ) app: App,
		@Inject( '$scope' ) private $scope: ng.IScope,
		@Inject( 'Growls' ) private growls: any,
		@Inject( 'Scroll' ) private scroll: any,
		@Inject( 'FormDashboardGameWizard' ) private wizard: FormDashboardGameWizard,
		@Inject( 'gettextCatalog' ) private gettextCatalog: ng.gettext.gettextCatalog
	)
	{
		app.title = gettextCatalog.getString( 'dash.games.edit.page_title', { game: $scope['manageCtrl'].game.title } );
	}

	onSaved()
	{
		if ( this.$scope['manageCtrl'].isWizard ) {
			this.wizard.goNext();
			return;
		}

		this.growls.success(
			this.gettextCatalog.getString( 'dash.games.edit.save_growl' ),
			this.gettextCatalog.getString( 'dash.games.edit.save_growl_title' )
		);

		this.scroll.to( 0 );
	}
}
