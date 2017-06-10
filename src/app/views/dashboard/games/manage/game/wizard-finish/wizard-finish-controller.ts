import { Injectable, Inject } from 'ng-metadata/core';
import { App } from '../../../../../../../app-service';

@Injectable()
export class WizardFinishCtrl
{
	constructor(
		@Inject( 'App' ) app: App,
		@Inject( 'gettextCatalog' ) gettextCatalog: ng.gettext.gettextCatalog,
	)
	{
		app.title = gettextCatalog.getString( 'The End Is Not the End' );
	}
}
