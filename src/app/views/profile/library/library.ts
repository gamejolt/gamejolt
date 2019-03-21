import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import {
	BaseRouteComponent,
	RouteResolver,
} from 'game-jolt-frontend-lib/components/route/route-component';
import { Component } from 'vue-property-decorator';
import { GameCollection } from '../../../components/game/collection/collection.model';
import AppGameCollectionGrid from '../../../components/game/collection/grid/grid.vue';
import { RouteStore, RouteStoreModule } from '../profile.store';

@Component({
	name: 'RouteProfileLibrary',
	components: {
		AppGameCollectionGrid,
	},
})
@RouteResolver({
	deps: {},
	resolver: ({ route }) => Api.sendRequest('/web/library/@' + route.params.username),
})
export default class RouteProfileLibrary extends BaseRouteComponent {
	@RouteStoreModule.State
	user!: RouteStore['user'];

	collections: GameCollection[] = [];

	get routeTitle() {
		if (this.user) {
			return this.$gettextInterpolate(`Library of @%{ user }`, {
				user: this.user.username,
			});
		}
		return null;
	}

	routeResolved($payload: any) {
		this.collections = GameCollection.populate($payload.collections);

		const followedCollection = new GameCollection($payload.followedCollection);

		const developerCollection = $payload.developerCollection
			? new GameCollection($payload.developerCollection)
			: null;

		this.collections.unshift(followedCollection);

		if (developerCollection) {
			this.collections.unshift(developerCollection);
		}
	}
}
