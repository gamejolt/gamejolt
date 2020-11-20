import { CreateElement } from 'vue';
import { Component } from 'vue-property-decorator';
import { router } from '..';
import { Api } from '../../../_common/api/api.service';
import {
	asyncRouteLoader,
	BaseRouteComponent,
	RouteResolver,
} from '../../../_common/route/route-component';
import { AppState, AppStore } from '../../../_common/store/app-store';
import { routeDiscoverHome } from '../discover/home/home.route';
import { routeHome } from './home.route';

@Component({
	name: 'RouteHome',
	components: {
		RouteHomeFeed: () => asyncRouteLoader(import('./feed.vue'), router),
		RouteDiscoverHome: () => asyncRouteLoader(import('../discover/home/home.vue'), router),
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

	routeResolved() {
		// The route content, but not the path, changes depending on the user
		// state - so we need to track the page view through a analyticsPath
		// meta value that aligns with our route content.
		this.$route.meta.analyticsPath = this.user ? routeHome.path : routeDiscoverHome.path;
	}

	render(h: CreateElement) {
		if (!this.userBootstrapped) {
			return h('div');
		}

		return h(this.user ? 'RouteHomeFeed' : 'RouteDiscoverHome');
	}
}
