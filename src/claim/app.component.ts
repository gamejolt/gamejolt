import { Component, Inject } from 'ng-metadata/core';
import * as template from '!html-loader!./app.component.html';
import { App } from './app-service';

@Component({
	selector: 'gj-app',
	template,
})
export class AppComponent
{
	currentDate = new Date();

	constructor(
		@Inject( 'App' ) public app: App,
	)
	{
	}
}
