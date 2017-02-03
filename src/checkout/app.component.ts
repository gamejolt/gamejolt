import { Component, Inject, Host, Optional } from 'ng-metadata/core';
import { StateService } from 'angular-ui-router';
import * as template from '!html-loader!./app.component.html';

import { App } from './app-service';
import { Screen } from '../lib/gj-lib-client/components/screen/screen-service';
import { Environment } from '../lib/gj-lib-client/components/environment/environment.service';

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
		@Inject( 'HistoryNavigator' ) @Host() @Optional() HistoryNavigator: any,
	)
	{
		$scope['$state'] = $state;
		$scope['App'] = App;
		$scope['Screen'] = Screen;
		$scope['Environment'] = Environment;
		$scope['HistoryNavigator'] = HistoryNavigator;

		// if ( GJ_IS_CLIENT ) {
		// 	$scope.HistoryNavigator = getProvider<any>( 'HistoryNavigator' );
		// }
	}
}

// export class AppCtrl
// {
// 	constructor(
// 		$scope: any,
// 		$state: any,
// 		App: any,
// 		Screen: any,
// 		Environment: any,
// 	)
// 	{
// 		$scope.$state = $state;
// 		$scope.App = App;
// 		$scope.Screen = Screen;
// 		$scope.Environment = Environment;

// 		if ( GJ_IS_CLIENT ) {
// 			$scope.HistoryNavigator = getProvider<any>( 'HistoryNavigator' );
// 		}
// 	}
// }
