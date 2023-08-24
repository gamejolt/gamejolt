<script lang="ts">
import { Inject, Options } from 'vue-property-decorator';
import { Api } from '../../../../../_common/api/api.service';
import { CollaboratorModel } from '../../../../../_common/collaborator/collaborator.model';
import {
	LegacyRouteComponent,
	OptionsForLegacyRoute,
} from '../../../../../_common/route/legacy-route-component';
import { Screen } from '../../../../../_common/screen/screen-service';
import { enforceLocation } from '../../../../../utils/router';
import { CommunityRouteStore, CommunityRouteStoreKey, updateCommunity } from '../view.store';

@Options({
	name: 'RouteCommunitiesViewEdit',
})
@OptionsForLegacyRoute({
	deps: { params: ['id'] },
	async resolver({ route }) {
		const payload = await Api.sendRequest('/web/dash/communities/' + route.params.id);

		if (payload && payload.community) {
			const redirect = enforceLocation(route, { path: payload.community.path });
			if (redirect) {
				return redirect;
			}
		}

		return payload;
	},
})
export default class RouteCommunitiesViewEdit extends LegacyRouteComponent {
	@Inject({ from: CommunityRouteStoreKey })
	routeStore!: CommunityRouteStore;

	readonly Screen = Screen;

	get routeTitle() {
		return this.$gettextInterpolate(`Edit Community - %{ community }`, {
			community: this.community.name,
		});
	}

	get community() {
		return this.routeStore.community;
	}

	routeResolved($payload: any) {
		updateCommunity(this.routeStore, $payload.community);
		this.routeStore.collaborator = $payload.collaboration
			? new CollaboratorModel($payload.collaboration)
			: null;
	}
}
</script>

<template>
	<router-view />
</template>
