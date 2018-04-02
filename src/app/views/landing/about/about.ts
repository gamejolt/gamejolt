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
		'#ccff00': 'black',
		'#2f7f6f': 'white',
		'#31d6ff': 'white',
		'#ff3fac': 'white',
	};
}
