import { Component, Inject } from 'ng-metadata/core';
import template from 'html!./user-box.component.html';
import { App } from '../../../app-service';

@Component({
	selector: 'gj-shell-user-box',
	template,
})
export class ShellUserBoxComponent
{
	constructor(
		@Inject( 'App' ) public app: App,
	)
	{
	}
}
