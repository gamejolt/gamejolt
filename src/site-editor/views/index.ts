import { h } from 'vue';
import { Options } from 'vue-property-decorator';
import { RouteConfig } from 'vue-router';
import { initRouter } from '../../utils/router';
import { BaseRouteComponent, RouteResolver } from '../../_common/route/route-component';
import { store } from '../store/index';

// Empty route component. We just use it to send API calls and set up the store for the app
// component to show the correct stuff.
@Options({
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
	render() {
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
