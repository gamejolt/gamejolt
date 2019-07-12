import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import {
	BaseRouteComponent,
	RouteResolver,
} from 'game-jolt-frontend-lib/components/route/route-component';
import { WithRouteStore } from 'game-jolt-frontend-lib/components/route/route-store';
import { enforceLocation } from 'game-jolt-frontend-lib/utils/router';
import { Component } from 'vue-property-decorator';
import { store } from '../../../../store';
import { routeStore, RouteStore, RouteStoreModule, RouteStoreName } from './edit.store';
import AppCommunitiesViewEditNav from './_nav/nav.vue';
import AppCommunitiesEditNotice from './_notice/notice.vue';

@Component({
	name: 'RouteCommunitiesViewEdit',
	components: {
		AppCommunitiesViewEditNav,
		AppCommunitiesEditNotice,
	},
})
@WithRouteStore({
	store,
	routeStoreName: RouteStoreName,
	routeStoreClass: RouteStore,
})
@RouteResolver({
	deps: { params: ['id'] },
	async resolver({ route }) {
		const payload = await Api.sendRequest('/web/dash/communities/' + route.params.id, {});

		if (payload && payload.community) {
			const redirect = enforceLocation(route, { path: payload.community.path });
			if (redirect) {
				return redirect;
			}
		}

		return payload;
	},
	resolveStore({ payload }) {
		routeStore.commit('populate', payload);
	},
})
export default class RouteCommunitiesViewEdit extends BaseRouteComponent {
	@RouteStoreModule.State
	community!: RouteStore['community'];
}
