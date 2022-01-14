import { h } from 'vue';
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import { RouteRecordRaw } from 'vue-router';
import { initRouter } from '../../utils/router';
import { Api } from '../../_common/api/api.service';
import { BaseRouteComponent, RouteResolver } from '../../_common/route/route-component';
import { useSiteEditorStore } from '../store/index';

// Empty route component. We just use it to send API calls and set up the store
// for the app component to show the correct stuff.
@Options({
	name: 'RouteEditor',
})
@RouteResolver({
	lazy: false,
	cache: false,
	resolver({ route }) {
		const siteId = parseInt(route.query.id as string, 10);
		return Api.sendRequest(`/web/dash/sites/editor/${siteId}`);
	},
})
class RouteEditor extends BaseRouteComponent {
	store = setup(() => useSiteEditorStore());

	routeResolved(payload: any) {
		this.store.bootstrapTab(this.$route.params.tab as any, payload);
	}

	render() {
		return h('div');
	}
}

const routes: RouteRecordRaw[] = [
	{
		name: 'editor',
		path: '/site-editor/:tab',
		component: RouteEditor,
	},
];

export const router = initRouter(routes);
