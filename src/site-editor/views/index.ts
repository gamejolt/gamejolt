import VueRouter from 'vue-router';
import { Component } from 'vue-property-decorator';
import { initRouter } from '../../lib/gj-lib-client/utils/router';
import Vue from 'vue';
import {
	RouteResolve,
	BaseRouteComponent,
} from '../../lib/gj-lib-client/components/route/route-component';
import { store } from '../store/index';

// Empty route component. We just use it to send API calls and set up the store for the app
// component to show the correct stuff.

@Component({
	name: 'RouteEditor',
})
class RouteEditor extends BaseRouteComponent {
	@RouteResolve({ lazy: false, cache: false })
	routeResolve(this: undefined, route: VueRouter.Route) {
		const tab: any = route.params.tab;
		const siteId = parseInt(route.query.id, 10);
		return store.dispatch('bootstrapTab', { tab, siteId });
	}

	render(h: Vue.CreateElement) {
		return h('div');
	}
}

const routes: VueRouter.RouteConfig[] = [
	{
		name: 'editor',
		path: '/site-editor/:tab',
		component: RouteEditor,
	},
];

export const router = initRouter(routes);
