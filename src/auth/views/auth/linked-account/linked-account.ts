import { h } from 'vue';
import { Options } from 'vue-property-decorator';
import { RouterView } from 'vue-router';
import {
	LegacyRouteComponent,
	OptionsForLegacyRoute,
} from '../../../../_common/route/legacy-route-component';

@Options({
	name: 'RouteAuthLinkedAccount',
})
@OptionsForLegacyRoute()
export default class RouteAuthLinkedAccount extends LegacyRouteComponent {
	render() {
		return h(RouterView);
	}
}
