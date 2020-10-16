import Component from 'vue-class-component';
import { BaseRouteComponent, RouteResolver } from '../../../_common/route/route-component';
import { User } from '../../../_common/user/user.model';

@Component({
	name: 'RouteBasement',
})
@RouteResolver({
	deps: {},
	resolver: () => User.touch(),
})
export default class RouteBasement extends BaseRouteComponent {
	get routeTitle() {
		return 'Basement';
	}
}
