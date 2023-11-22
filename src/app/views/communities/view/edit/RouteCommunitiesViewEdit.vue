<script lang="ts">
import { computed, toRef } from 'vue';
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
	}),
};
</script>
<script lang="ts" setup>
const routeStore = useCommunityRouteStore()!;

const community = toRef(() => routeStore.community);

createAppRoute({
	routeTitle: computed(() =>
		$gettext(`Edit Community - %{ community }`, {
			community: community.value.name,
		})
	),
	onResolved({ payload }) {
		updateCommunity(routeStore, payload.community);
		routeStore.collaborator = payload.collaboration
			? new CollaboratorModel(payload.collaboration)
			: null;
	},
});
</script>

<template>
	<RouterView />
</template>
