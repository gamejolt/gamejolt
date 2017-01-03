import { Component, Inject } from 'ng-metadata/core';
import { Shell } from '../shell-service';
import template from 'html!./body.component.html';

@Component({
	selector: 'gj-shell-body',
	template,
	legacy: {
		transclude: true,
	},
})
export class ShellBodyComponent
{
	constructor(
		@Inject( 'Shell' ) public shell: Shell,
	)
	{
	}
}
