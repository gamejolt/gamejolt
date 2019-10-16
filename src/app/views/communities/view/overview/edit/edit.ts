import Component from 'vue-class-component';
import { enforceLocation } from '../../../../../../utils/router';
import AppAlertDismissable from '../../../../../../_common/alert/dismissable/dismissable.vue';
import { Api } from '../../../../../../_common/api/api.service';
import { CommunityChannel } from '../../../../../../_common/community/channel/channel.model';
import { Community } from '../../../../../../_common/community/community.model';
import { BaseRouteComponent, RouteResolver } from '../../../../../../_common/route/route-component';
import { WithRouteStore } from '../../../../../../_common/route/route-store';
import { Screen } from '../../../../../../_common/screen/screen-service';
import { store } from '../../../../../store';
import { RouteStore, routeStore, RouteStoreModule, RouteStoreName } from './edit.store';
import AppCommunitiesOverviewEditNotice from './_notice/notice.vue';

@Component({
	name: 'RouteCommunitiesViewEdit',
	components: {
		AppAlertDismissable,
		AppCommunitiesOverviewEditNotice,
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
		if (payload) {
			routeStore.commit('populate', payload);
		}
	},
})
export default class RouteCommunitiesViewEdit extends BaseRouteComponent {
	@RouteStoreModule.State
	community!: RouteStore['community'];

	@RouteStoreModule.State
	collaboration!: RouteStore['collaboration'];

	readonly Screen = Screen;

	get isOwner() {
		// The owner's collaboration is not returned from backend.
		return this.collaboration === null;
	}

	onDetailsChange(community: Community) {
		this.$emit('details-change', community);
	}

	onChannelsChange(channels: CommunityChannel[]) {
		this.$emit('details-change', channels);
	}
}
