import { Component } from 'ng-metadata/core';
import * as template from '!html-loader!./hot-bottom.component.html';

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
