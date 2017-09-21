import { Component } from 'vue-property-decorator';
import * as View from '!view!./sent-key.html';

import { BaseRouteComponent } from '../../../lib/gj-lib-client/components/route/route-component';

@View
@Component({
	name: 'RouteSentKey',
})
export default class RouteSentKey extends BaseRouteComponent {
	get routeTitle() {
		return this.$gettext('Keys Sent');
	}
}
