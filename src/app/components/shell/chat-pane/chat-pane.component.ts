import { Component, Inject } from 'ng-metadata/core';
import { Shell } from '../shell-service';
import { Screen } from '../../../../lib/gj-lib-client/components/screen/screen-service';
import * as template from '!html-loader!./chat-pane.component.html';

@Component({
	selector: 'gj-shell-chat-pane',
	template,
})
export class ShellChatPaneComponent
{
	screen = Screen;

	constructor(
		@Inject( 'Shell' ) public shell: Shell,
	)
	{
	}
}
