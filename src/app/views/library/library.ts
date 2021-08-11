import { h } from 'vue';
import { Options } from 'vue-property-decorator';
import { BaseRouteComponent, RouteResolver } from '../../../_common/route/route-component';
import { User } from '../../../_common/user/user.model';

@Options({
	name: 'RouteLibrary',
})
@RouteResolver({
	deps: {},
	// Make sure the children know if we're logged in or not.
	resolver: () => User.touch(),
})
export default class RouteLibrary extends BaseRouteComponent {
	render() {
		return h('router-view');
	}
}
