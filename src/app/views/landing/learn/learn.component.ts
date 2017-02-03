import { Component, Inject } from 'ng-metadata/core';
import * as template from '!html-loader!./learn.component.html';

import { Meta } from '../../../../lib/gj-lib-client/components/meta/meta-service';
import { App } from '../../../app-service';

@Component({
	selector: 'route-landing-learn',
	template,
})
export class RouteLearnComponent
{
	constructor(
		@Inject( 'Meta' ) meta: Meta,
		@Inject( 'App' ) public app: App,
	)
	{
		meta.title = null;
	}
}
