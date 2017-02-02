import { Component, Inject } from 'ng-metadata/core';
import { StateService } from 'angular-ui-router';
import * as template from '!html-loader!./app.component.html';

import { App } from './app-service';
import { Meta } from '../lib/gj-lib-client/components/meta/meta-service';
import { Screen } from '../lib/gj-lib-client/components/screen/screen-service';
import { Environment } from '../lib/gj-lib-client/components/environment/environment.service';
import { Shell } from './components/shell/shell-service';
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
		@Inject( 'Meta' ) Meta: Meta,
		@Inject( 'Screen' ) Screen: Screen,
		@Inject( 'Scroll' ) Scroll: any,
		@Inject( 'Shell' ) Shell: Shell,
		@Inject( 'Connection' ) Connection: Connection,
	)
	{
		$scope['$state'] = $state;
		$scope['App'] = App;
		$scope['Meta'] = Meta;
		$scope['Screen'] = Screen;
		$scope['Environment'] = Environment;
		$scope['Scroll'] = Scroll;
		$scope['Shell'] = Shell;
		$scope['Connection'] = Connection;
	}
}
