import { Component, Input, Inject } from 'ng-metadata/core';
import { App } from '../../../app-service';
import { Screen } from '../../../../lib/gj-lib-client/components/screen/screen-service';
import { Environment } from '../../../../lib/gj-lib-client/components/environment/environment.service';
import template from 'html!./menu-popover.component.html';

@Component({
	selector: 'gj-shell-menu-popover',
	template,
})
export class ShellMenuPopoverComponent
{
	@Input( '=' ) isShown = false;

	constructor(
		@Inject( 'App' ) public app: App,
		@Inject( 'Screen' ) public screen: Screen,
		@Inject( 'Environment' ) public env: Environment,
	)
	{
	}
}
