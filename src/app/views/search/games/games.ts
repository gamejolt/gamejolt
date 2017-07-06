import Vue from 'vue';
import VueRouter from 'vue-router';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./games.html';

import { BeforeRouteEnter } from '../../../../lib/gj-lib-client/utils/router';
import { Search } from '../../../components/search/search-service';
import { makeObservableService } from '../../../../lib/gj-lib-client/utils/vue';
import { AppGameGrid } from '../../../components/game/grid/grid';

@View
@Component({
	components: {
		AppGameGrid,
	},
})
export default class RouteSearchGames extends Vue {
	@Prop([Object])
	payload: any;

	Search = makeObservableService(Search);

	@BeforeRouteEnter({ cache: true })
	routeEnter(this: undefined, route: VueRouter.Route) {
		return Search.search(route.query.q, {
			type: 'game',
			page: route.query.page ? parseInt(route.query.page, 10) : 1,
		});
	}

	routed() {
		this.$emit('searchpayload', this.$payload);
	}
}
