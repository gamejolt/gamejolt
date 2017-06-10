import { Injectable, Inject } from 'ng-metadata/core';
import { App } from '../../../../../app-service';
import { FormDashboardGameWizard } from '../../../../../components/forms/dashboard/game/wizard/wizard-service';

@Injectable()
export class AddCtrl
{
	constructor(
		@Inject( 'App' ) app: App,
		@Inject( 'gettextCatalog' ) gettextCatalog: ng.gettext.gettextCatalog,
		@Inject( 'FormDashboardGameWizard' ) private wizard: FormDashboardGameWizard
	)
	{
		app.title = gettextCatalog.getString( 'dash.games.add.page_title' );
	}

	onSubmit( game: any )
	{
		this.wizard.start( game );
	}
}
