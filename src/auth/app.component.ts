import { Component, Inject } from 'ng-metadata/core';
import { StateService } from 'angular-ui-router';
import * as template from '!html-loader!./app.component.html';

import { App } from './app-service';
import { Screen } from '../lib/gj-lib-client/components/screen/screen-service';
import { Environment } from '../lib/gj-lib-client/components/environment/environment.service';
import { Connection } from '../lib/gj-lib-client/components/connection/connection-service';

@Component({
	selector: 'gj-app',
	template,
})
export class AppComponent
{
	constructor(
		@Inject( '$scope' ) $scope: ng.IScope,
		@Inject( '$state' ) $state: StateService,
		@Inject( 'App' ) App: App,
		@Inject( 'Screen' ) Screen: Screen,
		@Inject( 'Connection' ) Connection: Connection,
	)
	{
		$scope['$state'] = $state;
		$scope['App'] = App;
		$scope['Screen'] = Screen;
		$scope['Environment'] = Environment;
		$scope['Connection'] = Connection;
	}
}
