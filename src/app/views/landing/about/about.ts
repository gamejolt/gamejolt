import { Component } from 'vue-property-decorator';
import View from '!view!./about.html?style=./about.styl';

import { importContext } from '../../../../lib/gj-lib-client/utils/utils';
import { Screen } from '../../../../lib/gj-lib-client/components/screen/screen-service';
import { BaseRouteComponent } from '../../../../lib/gj-lib-client/components/route/route-component';

@View
@Component({
	name: 'RouteLandingAbout',
})
export default class RouteLandingAbout extends BaseRouteComponent {
	readonly assetUrls = importContext(require.context('./', false, /\.png$/));
	readonly Screen = Screen;

	colors = {
		ccff00: 'fill-green',
		'2f7f6f': 'fill-dark-green',
		'31d6ff': 'fill-blue',
		ff3fac: 'fill-pink',
	};

	grays = {
		'191919': 'fill-darkest',
		'292929': 'fill-darker',
		'363636': 'fill-dark',
		'555555': 'fill-gray',
		'7e7e7e': 'fill-light',
		d1d1d1: 'fill-lighter',
		f3f3f3: 'fill-lightest',
	};
}
