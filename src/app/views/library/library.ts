import { h } from 'vue';
import { Options } from 'vue-property-decorator';
import { RouterView } from 'vue-router';
import {
	LegacyRouteComponent,
	OptionsForLegacyRoute,
} from '../../../_common/route/legacy-route-component';
import { touchUser } from '../../../_common/user/user.model';

@Options({
	name: 'RouteLibrary',
})
@OptionsForLegacyRoute({
	reloadOn: 'never',
	// Make sure the children know if we're logged in or not.
	resolver: () => touchUser(),
})
export default class RouteLibrary extends LegacyRouteComponent {
	render() {
		return h(RouterView);
	}
}
