import { CreateElement } from 'vue';
import { Component } from 'vue-property-decorator';
import {
	BaseRouteComponent,
	RouteResolver,
} from '../../../lib/gj-lib-client/components/route/route-component';
import { User } from '../../../lib/gj-lib-client/components/user/user.model';

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
