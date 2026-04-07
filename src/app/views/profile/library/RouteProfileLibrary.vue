<script lang="ts">
import { Api } from '../../../../_common/api/api.service';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '../../../../_common/route/route-component';

export default {
	name: 'RouteProfileLibrary',
	...defineAppRouteOptions({
		reloadOn: 'never',
		resolver: ({ route }) => Api.sendRequest('/web/library/@' + route.params.username),
	}),
};
</script>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { $gettext } from '../../../../_common/translate/translate.service';
import { GameCollectionModel } from '../../../components/game/collection/collection.model';
import AppGameCollectionGrid from '../../../components/game/collection/grid/AppGameCollectionGrid.vue';
import { useProfileRouteStore } from '../RouteProfile.vue';

const routeStore = useProfileRouteStore()!;

const collections = ref<GameCollectionModel[]>([]);

const user = computed(() => routeStore.user);

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
		<div class="container">
			<AppGameCollectionGrid :collections="collections" />
		</div>
	</section>
</template>
