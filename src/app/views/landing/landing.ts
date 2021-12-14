import { h } from 'vue';
import { Options } from 'vue-property-decorator';
import { RouterView } from 'vue-router';
import { BaseRouteComponent, RouteResolver } from '../../../_common/route/route-component';
import { User } from '../../../_common/user/user.model';

@Options({
	name: 'RouteLanding',
})
@RouteResolver({
	deps: {},
	resolver: () => User.touch(),
})
export default class RouteLanding extends BaseRouteComponent {
	render() {
		return h(RouterView);
	}
}
