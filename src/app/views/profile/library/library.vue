<script lang="ts">
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import { Api } from '../../../../_common/api/api.service';
import { BaseRouteComponent, OptionsForRoute } from '../../../../_common/route/route-component';
import { GameCollection } from '../../../components/game/collection/collection.model';
import AppGameCollectionGrid from '../../../components/game/collection/grid/grid.vue';
import { useProfileRouteController } from '../RouteProfile.vue';

@Options({
	name: 'RouteProfileLibrary',
	components: {
		AppGameCollectionGrid,
	},
})
@OptionsForRoute({
	deps: {},
	resolver: ({ route }) => Api.sendRequest('/web/library/@' + route.params.username),
})
export default class RouteProfileLibrary extends BaseRouteComponent {
	routeStore = setup(() => useProfileRouteController()!);

	collections: GameCollection[] = [];

	get routeTitle() {
		if (this.user) {
			return this.$gettextInterpolate(`Library of @%{ user }`, {
				user: this.user.username,
			});
		}
		return null;
	}

	get user() {
		return this.routeStore.user;
	}

	routeResolved(payload: any) {
		this.collections = GameCollection.populate(payload.collections);

		const followedCollection = new GameCollection(payload.followedCollection);

		const developerCollection = payload.developerCollection
			? new GameCollection(payload.developerCollection)
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
