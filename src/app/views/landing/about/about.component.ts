import { Component, Inject } from 'ng-metadata/core';
import { importContext, RequireContextMap } from '../../../../lib/gj-lib-client/utils/utils';

import * as template from '!html-loader!./about.component.html';

import { Meta } from '../../../../lib/gj-lib-client/components/meta/meta-service';
import { Screen } from '../../../../lib/gj-lib-client/components/screen/screen-service';

@Component({
	selector: 'route-landing-about',
	template,
})
export class RouteAboutComponent
{
	assetUrls: RequireContextMap;

	constructor(
		@Inject( 'Screen' ) public screen: Screen,
	)
	{
		Meta.title = null;

		this.assetUrls = importContext( require.context( './', false, /\.png$/ ) );
	}
}
