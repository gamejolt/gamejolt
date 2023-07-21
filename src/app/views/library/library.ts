import { h } from 'vue';
import { Options } from 'vue-property-decorator';
import { RouterView } from 'vue-router';
import { BaseRouteComponent, OptionsForRoute } from '../../../_common/route/route-component';
import { touchUser } from '../../../_common/user/user.model';

@Options({
	name: 'RouteLibrary',
})
@OptionsForRoute({
	deps: {},
	// Make sure the children know if we're logged in or not.
	resolver: () => touchUser(),
})
export default class RouteLibrary extends BaseRouteComponent {
	render() {
		return h(RouterView);
	}
}
