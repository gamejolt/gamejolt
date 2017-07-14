import Vue from 'vue';
import VueRouter from 'vue-router';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./library.html';

import { RouteResolve } from '../../../../lib/gj-lib-client/utils/router';
import { GameCollection } from '../../../components/game/collection/collection.model';
import { Api } from '../../../../lib/gj-lib-client/components/api/api.service';
import { User } from '../../../../lib/gj-lib-client/components/user/user.model';
import { Meta } from '../../../../lib/gj-lib-client/components/meta/meta-service';
import { AppGameCollectionGrid } from '../../../components/game/collection/grid/grid';

@View
@Component({
	components: {
		AppGameCollectionGrid,
	},
})
export default class RouteProfileLibrary extends Vue {
	@Prop() user: User;

	collections: GameCollection[] = [];

	@RouteResolve()
	routeResolve(this: undefined, route: VueRouter.Route) {
		return Api.sendRequest('/web/library/@' + route.params.username);
	}

	routed() {
		Meta.title = this.$gettextInterpolate(`Library of @%{ user }`, {
			user: this.user.username,
		});

		this.collections = GameCollection.populate(this.$payload.collections);

		const followedCollection = new GameCollection(this.$payload.followedCollection);
		const ownedCollection = new GameCollection(this.$payload.ownedCollection);
		const recommendedCollection = new GameCollection(this.$payload.recommendedCollection);

		const developerCollection = this.$payload.developerCollection
			? new GameCollection(this.$payload.developerCollection)
			: null;

		this.collections.unshift(recommendedCollection);
		this.collections.unshift(ownedCollection);
		this.collections.unshift(followedCollection);

		if (developerCollection) {
			this.collections.unshift(developerCollection);
		}
	}
}
