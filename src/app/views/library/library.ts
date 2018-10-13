import { CreateElement } from 'vue';
import { Component } from 'vue-property-decorator';
import {
	BaseRouteComponent,
	RouteResolver,
} from '../../../lib/gj-lib-client/components/route/route-component';
import { User } from '../../../lib/gj-lib-client/components/user/user.model';

@Component({
	name: 'RouteLibrary',
})
@RouteResolver({
	deps: {},
	// Make sure the children know if we're logged in or not.
	resolver: () => User.touch(),
})
export default class RouteLibrary extends BaseRouteComponent {
	render(h: CreateElement) {
		return h('router-view');
	}
}
