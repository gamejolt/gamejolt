import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import {
	asyncRouteLoader,
	BaseRouteComponent,
	RouteResolver,
} from 'game-jolt-frontend-lib/components/route/route-component';
import { AppState, AppStore } from 'game-jolt-frontend-lib/vue/services/app/app-store';
import { CreateElement } from 'vue';
import { Component } from 'vue-property-decorator';
import { router } from '..';

@Component({
	name: 'RouteHome',
	components: {
		RouteHomeFeed: () => asyncRouteLoader(import('./feed'), router),
		RouteDiscoverHome: () => asyncRouteLoader(import('../discover/home/home'), router),
	},
})
@RouteResolver({
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

		return h(!!this.user ? 'RouteHomeFeed' : 'RouteDiscoverHome');
	}
}
