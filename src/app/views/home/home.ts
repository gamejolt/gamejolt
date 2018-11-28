import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import {
	BaseRouteComponent,
	RouteResolver,
} from 'game-jolt-frontend-lib/components/route/route-component';
import { AppState, AppStore } from 'game-jolt-frontend-lib/vue/services/app/app-store';
import { CreateElement } from 'vue';
import { Component } from 'vue-property-decorator';
import RouteDiscoverHome from '../discover/home/home';
import RouteActivityFeed from './feed';

@Component({
	name: 'RouteHome',
})
@RouteResolver({
	// No need to wait since the render function handles when there is no user
	// bootstrapped yet.
	lazy: true,
	resolver: () => Api.sendRequest('/web/touch'),
})
export default class RouteHome extends BaseRouteComponent {
	@AppState
	user!: AppStore['user'];

	@AppState
	userBootstrapped!: AppStore['userBootstrapped'];

	render(h: CreateElement) {
		if (!this.userBootstrapped) {
			return h('div');
		}

		return h(!!this.user ? RouteActivityFeed : RouteDiscoverHome);
	}
}
