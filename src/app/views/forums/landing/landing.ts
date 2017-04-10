import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./landing.html?style=./landing.styl';

import { AppPageHeader } from '../../../components/page-header/page-header';
import { makeObservableService } from '../../../../lib/gj-lib-client/utils/vue';
import { Screen } from '../../../../lib/gj-lib-client/components/screen/screen-service';

@View
@Component({
	components: {
		AppPageHeader,
	},
})
export default class RouteForumsLanding extends Vue
{
	Screen = makeObservableService( Screen );
}
