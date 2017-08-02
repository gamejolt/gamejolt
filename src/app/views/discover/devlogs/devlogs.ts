import { Component } from 'vue-property-decorator';
import * as View from '!view!./devlogs.html';

import { AppPageHeader } from '../../../components/page-header/page-header';
import { BaseRouteComponent } from '../../../../lib/gj-lib-client/components/route/route-component';

@View
@Component({
	name: 'RouteDiscoverDevlogs',
	components: {
		AppPageHeader,
	},
})
export default class RouteDiscoverDevlogs extends BaseRouteComponent {}
