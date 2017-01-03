import { Component, Inject } from 'ng-metadata/core';
import { Shell } from '../shell-service';
import { Screen } from '../../../../lib/gj-lib-client/components/screen/screen-service';
import template from 'html!./chat-pane.component.html';

@Component({
	selector: 'gj-shell-chat-pane',
	template,
})
export class ShellChatPaneComponent
{
	constructor(
		@Inject( 'Shell' ) public shell: Shell,
		@Inject( 'Screen' ) public screen: Screen,
	)
	{
	}
}
