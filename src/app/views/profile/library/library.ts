import { Route } from 'vue-router';
import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./library.html';

import { GameCollection } from '../../../components/game/collection/collection.model';
import { Api } from '../../../../lib/gj-lib-client/components/api/api.service';
import { AppGameCollectionGrid } from '../../../components/game/collection/grid/grid';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../lib/gj-lib-client/components/route/route-component';
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

	@RouteResolve()
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
