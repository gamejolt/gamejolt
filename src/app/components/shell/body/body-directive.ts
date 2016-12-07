import { Component } from 'ng-metadata/core';
import template from 'html!./body.html';

@Component({
	selector: 'gj-shell-body',
	template,
	legacy: {
		transclude: true,
	},
})
export class BodyComponent
{
	constructor(
	)
	{
	}
}
