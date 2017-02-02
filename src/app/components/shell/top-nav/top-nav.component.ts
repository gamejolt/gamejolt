import { Component, Inject } from 'ng-metadata/core';
import { StateService } from 'angular-ui-router';
import * as template from '!html-loader!./top-nav.component.html';

import { App } from '../../../app-service';
import { Shell } from '../shell-service';
import { Screen } from '../../../../lib/gj-lib-client/components/screen/screen-service';
import { Connection } from '../../../../lib/gj-lib-client/components/connection/connection-service';
import { Environment } from '../../../../lib/gj-lib-client/components/environment/environment.service';

@Component({
	selector: 'gj-shell-top-nav',
	template,
})
export class ShellTopNavComponent
{
	notificationsCount = 0;
	friendRequestCount = 0;

	env = Environment;

	constructor(
		@Inject( '$state' ) public $state: StateService,
		@Inject( 'App' ) public app: App,
		@Inject( 'Shell' ) public shell: Shell,
		@Inject( 'Screen' ) public screen: Screen,
		@Inject( 'Connection' ) public conn: Connection,
	)
	{
	}
}
