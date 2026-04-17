<script lang="ts">
import { computed, ref } from 'vue';

import { GameCollectionModel } from '~app/components/game/collection/collection.model';
import AppGameCollectionGrid from '~app/components/game/collection/grid/AppGameCollectionGrid.vue';
import { useProfileRouteStore } from '~app/views/profile/RouteProfile.vue';
import { Api } from '~common/api/api.service';
import { createAppRoute, defineAppRouteOptions } from '~common/route/route-component';
import { $gettext } from '~common/translate/translate.service';

export default {
	name: 'RouteProfileLibrary',
	...defineAppRouteOptions({
		reloadOn: 'never',
		resolver: ({ route }) => Api.sendRequest('/web/library/@' + route.params.username),
	}),
};
</script>

<script lang="ts" setup>
const { user } = useProfileRouteStore()!;

const collections = ref<GameCollectionModel[]>([]);

createAppRoute({
	routeTitle: computed(() => {
		if (user.value) {
			return $gettext(`Library of @%{ user }`, {
				user: user.value.username,
			});
		}
		return null;
	}),
	onResolved({ payload }) {
		collections.value = GameCollectionModel.populate(payload.collections);

		const followedCollection = new GameCollectionModel(payload.followedCollection);

		const developerCollection = payload.developerCollection
			? new GameCollectionModel(payload.developerCollection)
			: null;

		collections.value.unshift(followedCollection);

		if (developerCollection) {
			collections.value.unshift(developerCollection);
		}
	},
});
</script>

<template>
	<section class="section">
		<div class="gj-container">
			<AppGameCollectionGrid :collections="collections" />
		</div>
	</section>
</template>
