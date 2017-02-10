import { Component } from 'ng-metadata/core';
import { importContext } from '../../../../lib/gj-lib-client/utils/utils';

import * as template from '!html-loader!./about.component.html';

import { Meta } from '../../../../lib/gj-lib-client/components/meta/meta-service';
import { Screen } from '../../../../lib/gj-lib-client/components/screen/screen-service';

@Component({
	selector: 'route-landing-about',
	template,
})
export class RouteAboutComponent
{
	assetUrls = importContext( require.context( './', false, /\.png$/ ) );
	screen = Screen;

	constructor()
	{
		Meta.title = null;
	}
}
