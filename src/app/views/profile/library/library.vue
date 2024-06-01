<script lang="ts">
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import { Api } from '../../../../_common/api/api.service';
import {
	LegacyRouteComponent,
	OptionsForLegacyRoute,
} from '../../../../_common/route/legacy-route-component';
import { $gettext } from '../../../../_common/translate/translate.service';
import { GameCollectionModel } from '../../../components/game/collection/collection.model';
import AppGameCollectionGrid from '../../../components/game/collection/grid/grid.vue';
import { useProfileRouteStore } from '../RouteProfile.vue';

@Options({
	name: 'RouteProfileLibrary',
	components: {
		AppGameCollectionGrid,
	},
})
@OptionsForLegacyRoute({
	reloadOn: 'never',
	resolver: ({ route }) => Api.sendRequest('/web/library/@' + route.params.username),
})
export default class RouteProfileLibrary extends LegacyRouteComponent {
	routeStore = setup(() => useProfileRouteStore()!);

	collections: GameCollectionModel[] = [];

	get routeTitle() {
		if (this.user) {
			return $gettext(`Library of @%{ user }`, {
				user: this.user.username,
			});
		}
		return null;
	}

	get user() {
		return this.routeStore.user;
	}

	routeResolved(payload: any) {
		this.collections = GameCollectionModel.populate(payload.collections);

		const followedCollection = new GameCollectionModel(payload.followedCollection);

		const developerCollection = payload.developerCollection
			? new GameCollectionModel(payload.developerCollection)
			: null;

		this.collections.unshift(followedCollection);

		if (developerCollection) {
			this.collections.unshift(developerCollection);
		}
	}
}
</script>

<template>
	<section class="section">
		<div class="container">
			<AppGameCollectionGrid :collections="collections" />
		</div>
	</section>
</template>
