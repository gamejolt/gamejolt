import { Component } from 'ng-metadata/core';
import template from 'html!./hot-bottom.component.html';

@Component({
	selector: 'gj-shell-hot-bottom',
	template,
	legacy: {
		transclude: true,
	}
})
export class ShellHotBottomComponent
{
}
