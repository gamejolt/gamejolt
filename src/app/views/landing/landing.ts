import {
	BaseRouteComponent,
	RouteResolver,
} from 'game-jolt-frontend-lib/components/route/route-component';
import { User } from 'game-jolt-frontend-lib/components/user/user.model';
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
