import { Component, Inject } from 'ng-metadata/core';
import * as template from '!html-loader!./app.component.html';

import { attachProvidersApp } from './app-service';

@Component({
	selector: 'gj-app',
	template,
})
export class AppComponent
{
	constructor(
		@Inject( '$scope' ) $scope: ng.IScope,
	)
	{
		attachProvidersApp( $scope );
	}
}
