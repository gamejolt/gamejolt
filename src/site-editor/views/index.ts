import { CreateElement } from 'vue';
import { Component } from 'vue-property-decorator';
import { Route, RouteConfig } from 'vue-router';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../lib/gj-lib-client/components/route/route-component';
import { initRouter } from '../../lib/gj-lib-client/utils/router';
import { store } from '../store/index';

// Empty route component. We just use it to send API calls and set up the store for the app
// component to show the correct stuff.

@Component({
	name: 'RouteEditor',
})
class RouteEditor extends BaseRouteComponent {
	@RouteResolve({ lazy: false, cache: false, reloadOnQueryChange: true })
	routeResolve(this: undefined, route: Route) {
		const tab: any = route.params.tab;
		const siteId = parseInt(route.query.id, 10);
		return store.dispatch('bootstrapTab', { tab, siteId });
	}

	render(h: CreateElement) {
		return h('div');
	}
}

const routes: RouteConfig[] = [
	{
		name: 'editor',
		path: '/site-editor/:tab',
		component: RouteEditor,
	},
];

export const router = initRouter(routes);
