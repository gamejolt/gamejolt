import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./about.html?style=./about.styl';

import { importContext } from '../../../../lib/gj-lib-client/utils/utils';
import { makeObservableService } from '../../../../lib/gj-lib-client/utils/vue';
import { Screen } from '../../../../lib/gj-lib-client/components/screen/screen-service';

@View
@Component({})
export default class RouteLandingAbout extends Vue
{
	assetUrls = importContext( require.context( './', false, /\.png$/ ) );
	Screen = makeObservableService( Screen );

	colors = {
		'ccff00': 'fill-green',
		'2f7f6f': 'fill-dark-green',
		'31d6ff': 'fill-blue',
		'ff3fac': 'fill-pink',
	};

	grays = {
		'191919': 'fill-darkest',
		'292929': 'fill-darker',
		'3e3e3e': 'fill-dark',
		'555555': 'fill-gray',
		'7e7e7e': 'fill-light',
		'c1c1c1': 'fill-lighter',
		'eeeeee': 'fill-lightest',
	};
}
