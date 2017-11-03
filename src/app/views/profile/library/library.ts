import VueRouter from 'vue-router';
import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./library.html';

import { GameCollection } from '../../../components/game/collection/collection.model';
import { Api } from '../../../../lib/gj-lib-client/components/api/api.service';
import { User } from '../../../../lib/gj-lib-client/components/user/user.model';
import { AppGameCollectionGrid } from '../../../components/game/collection/grid/grid';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../lib/gj-lib-client/components/route/route-component';

@View
@Component({
	name: 'RouteProfileLibrary',
	components: {
		AppGameCollectionGrid,
	},
})
export default class RouteProfileLibrary extends BaseRouteComponent {
	@Prop() user: User;

	collections: GameCollection[] = [];

	@RouteResolve()
	routeResolve(this: undefined, route: VueRouter.Route) {
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
		const ownedCollection = new GameCollection($payload.ownedCollection);
		const recommendedCollection = new GameCollection($payload.recommendedCollection);

		const developerCollection = $payload.developerCollection
			? new GameCollection($payload.developerCollection)
			: null;

		this.collections.unshift(recommendedCollection);
		this.collections.unshift(ownedCollection);
		this.collections.unshift(followedCollection);

		if (developerCollection) {
			this.collections.unshift(developerCollection);
		}
	}
}
