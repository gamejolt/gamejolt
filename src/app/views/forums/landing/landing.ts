import { Component } from 'vue-property-decorator';
import * as View from '!view!./landing.html?style=./landing.styl';

import { AppPageHeader } from '../../../components/page-header/page-header';
import { makeObservableService } from '../../../../lib/gj-lib-client/utils/vue';
import { Screen } from '../../../../lib/gj-lib-client/components/screen/screen-service';
import { BaseRouteComponent } from '../../../../lib/gj-lib-client/components/route/route-component';

@View
@Component({
	name: 'RouteForumsLanding',
	components: {
		AppPageHeader,
	},
})
export default class RouteForumsLanding extends BaseRouteComponent {
	Screen = makeObservableService(Screen);
}
