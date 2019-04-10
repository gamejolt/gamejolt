import {
	BaseRouteComponent,
	RouteResolver,
} from 'game-jolt-frontend-lib/components/route/route-component';
import { initRouter } from 'game-jolt-frontend-lib/utils/router';
import { CreateElement } from 'vue';
import { Component } from 'vue-property-decorator';
import { RouteConfig } from 'vue-router';
import { store } from '../store/index';

// Empty route component. We just use it to send API calls and set up the store for the app
// component to show the correct stuff.

@Component({
	name: 'RouteEditor',
})
@RouteResolver({
	lazy: false,
	cache: false,
	resolver({ route }) {
		const tab: any = route.params.tab;
		const siteId = parseInt(route.query.id as string, 10);
		return store.dispatch('bootstrapTab', { tab, siteId });
	},
})
class RouteEditor extends BaseRouteComponent {
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
