import { Component } from 'vue-property-decorator';
import * as View from '!view!./sent-key.html';

import { Meta } from '../../../lib/gj-lib-client/components/meta/meta-service';
import { BaseRouteComponent } from '../../../lib/gj-lib-client/components/route/route-component';

@View
@Component({})
export default class RouteSentKey extends BaseRouteComponent {
	routeInit() {
		Meta.title = this.$gettext('Keys Sent');
	}
}
