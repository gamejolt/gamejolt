import { Component } from 'vue-property-decorator';
import View from '!view!./devlogs.html';

import { AppPageHeader } from '../../../components/page-header/page-header';
import { BaseRouteComponent } from '../../../../lib/gj-lib-client/components/route/route-component';

// TODO(rewrite,cros) devlog listing looks wrong.
// This is probably the same as the feed/notifications displaying wrong and not switching between tabs properly.
@View
@Component({
	name: 'RouteDiscoverDevlogs',
	components: {
		AppPageHeader,
	},
})
export default class RouteDiscoverDevlogs extends BaseRouteComponent {}
