import { Component, Inject } from 'ng-metadata/core';
import * as template from '!html-loader!./game-api.component.html';

import { Meta } from '../../../../lib/gj-lib-client/components/meta/meta-service';

@Component({
	selector: 'route-landing-game-api',
	template,
})
export class RouteGameApiComponent
{
	constructor()
	{
		Meta.title = null;
	}
}
