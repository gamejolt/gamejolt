import { Component } from 'ng-metadata/core';
import * as template from '!html-loader!./sent-key.component.html';

import { Meta } from '../../../lib/gj-lib-client/components/meta/meta-service';

@Component({
	selector: 'route-sent-key',
	template,
})
export class RouteSentKeyComponent
{
	constructor()
	{
		Meta.title = 'Keys Sent';
	}
}
