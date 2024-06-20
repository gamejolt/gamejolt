<script lang="ts">
import { computed } from 'vue';
import { RouterView } from 'vue-router';
import { Api } from '../../../../../_common/api/api.service';
import { CollaboratorModel } from '../../../../../_common/collaborator/collaborator.model';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '../../../../../_common/route/route-component';
import { $gettext } from '../../../../../_common/translate/translate.service';
import { enforceLocation } from '../../../../../utils/router';
import { updateCommunity, useCommunityRouteStore } from '../view.store';

export default {
	...defineAppRouteOptions({
		reloadOn: { params: ['id'] },
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
	}),
};
</script>
<script lang="ts" setup>
const routeStore = useCommunityRouteStore()!;
const { community, collaborator } = routeStore;

createAppRoute({
	routeTitle: computed(() =>
		$gettext(`Edit Community - %{ community }`, {
			community: community.value?.name || '',
		})
	),
	onResolved({ payload }) {
		updateCommunity(routeStore, payload.community);
		collaborator.value = payload.collaboration
			? new CollaboratorModel(payload.collaboration)
			: undefined;
	},
});
</script>

<template>
	<RouterView />
</template>
