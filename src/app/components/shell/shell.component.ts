import { Component, Inject } from 'ng-metadata/core';
import { Shell } from './shell-service';
import template from 'html!./shell.component.html';

@Component({
	selector: 'gj-shell',
	template,
	legacy: {
		transclude: true,
	}
})
export class ShellComponent
{
	constructor(
		@Inject( 'Shell' ) public shell: Shell,
	)
	{
	}
}
