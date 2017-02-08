import { Component } from 'ng-metadata/core';
import * as template from '!html-loader!./invalid-key.component.html';

import { Meta } from '../../../lib/gj-lib-client/components/meta/meta-service';

@Component({
	selector: 'route-invalid-key',
	template,
})
export class RouteInvalidKeyComponent
{
	constructor()
	{
		Meta.title = 'Invalid Key';
	}
}
