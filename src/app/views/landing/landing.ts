import { BaseRouteComponent, RouteResolver } from '../../../_common/route/route-component';
import { User } from '../../../_common/user/user.model';
import { CreateElement } from 'vue';
import { Component } from 'vue-property-decorator';

@Component({
	name: 'RouteLanding',
})
@RouteResolver({
	deps: {},
	resolver: () => User.touch(),
})
export default class RouteLanding extends BaseRouteComponent {
	render(h: CreateElement) {
		return h('router-view');
	}
}
