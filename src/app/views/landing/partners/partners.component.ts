import { Component, Inject } from 'ng-metadata/core';
import * as template from '!html-loader!./partners.component.html';

import { Meta } from '../../../../lib/gj-lib-client/components/meta/meta-service';

@Component({
	selector: 'route-landing-partners',
	template,
})
export class RoutePartnersComponent
{
	constructor()
	{
		Meta.title = null;
	}
}
