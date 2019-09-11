import { Component } from 'vue-property-decorator';
import { BaseRouteComponent } from '../../../_common/route/route-component';

@Component({
	name: 'RouteSentKey',
})
export default class RouteSentKey extends BaseRouteComponent {
	get routeTitle() {
		return this.$gettext('Keys Sent');
	}
}
