import View from '!view!./library.html';
import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import {
	BaseRouteComponent,
	RouteResolve,
} from 'game-jolt-frontend-lib/components/route/route-component';
import { Component } from 'vue-property-decorator';
import { Route } from 'vue-router';
import { GameCollection } from '../../../components/game/collection/collection.model';
import { AppGameCollectionGrid } from '../../../components/game/collection/grid/grid';
import { RouteState, RouteStore } from '../profile.store';

@View
@Component({
	name: 'RouteProfileLibrary',
	components: {
		AppGameCollectionGrid,
	},
})
export default class RouteProfileLibrary extends BaseRouteComponent {
	@RouteState
	user!: RouteStore['user'];

	collections: GameCollection[] = [];

	@RouteResolve({
		deps: {},
	})
	routeResolve(this: undefined, route: Route) {
		return Api.sendRequest('/web/library/@' + route.params.username);
	}

	get routeTitle() {
		if (this.user) {
			return this.$gettextInterpolate(`Library of @%{ user }`, {
				user: this.user.username,
			});
		}
		return null;
	}

	routed($payload: any) {
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
