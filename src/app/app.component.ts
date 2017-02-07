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
		// @Inject( '$state' ) $state: StateService,
		// @Inject( 'App' ) App: App,
		// @Inject( 'Meta' ) Meta: Meta,
		// @Inject( 'Screen' ) Screen: Screen,
		// @Inject( 'Scroll' ) Scroll: any,
		// @Inject( 'Shell' ) Shell: Shell,
		// @Inject( 'Connection' ) Connection: Connection,
	)
	{
		attachProvidersApp( $scope );
		// $scope['$state'] = $state;
		// $scope['App'] = App;
		// $scope['Meta'] = Meta;
		// $scope['Screen'] = Screen;
		// $scope['Environment'] = Environment;
		// $scope['Scroll'] = Scroll;
		// $scope['Shell'] = Shell;
		// $scope['Connection'] = Connection;
	}
}
