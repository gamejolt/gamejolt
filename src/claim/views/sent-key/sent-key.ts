import { BaseRouteComponent } from 'game-jolt-frontend-lib/components/route/route-component';
import { Component } from 'vue-property-decorator';

@Component({
	name: 'RouteSentKey',
})
export default class RouteSentKey extends BaseRouteComponent {
	get routeTitle() {
		return this.$gettext('Keys Sent');
	}
}
