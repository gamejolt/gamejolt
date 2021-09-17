import { Component, Inject } from 'vue-property-decorator';
import { Route } from 'vue-router';
import { Api } from '../../../../../_common/api/api.service';
import { Fireside } from '../../../../../_common/fireside/fireside.model';
import { BaseRouteComponent, RouteResolver } from '../../../../../_common/route/route-component';
import { CommunityRouteStore, CommunityRouteStoreKey } from '../view.store';
import AppCommunitiesViewPageContainer from '../_page-container/page-container.vue';
import AppFiresidesList from './list/list.vue';

function getFetchUrl(route: Route) {
	return `/web/communities/firesides/${route.params.path}`;
}

@Component({
	name: 'RouteCommunitiesViewFiresides',
	components: {
		AppCommunitiesViewPageContainer,
		AppFiresidesList,
	},
})
@RouteResolver({
	cache: true,
	lazy: true,
	deps: {
		params: ['path'],
	},
	resolver: ({ route }) => Api.sendRequest(getFetchUrl(route)),
})
export default class RouteCommunitiesViewMembers extends BaseRouteComponent {
	@Inject(CommunityRouteStoreKey) routeStore!: CommunityRouteStore;

	firesides: Fireside[] = [];

	get community() {
		return this.routeStore.community;
	}

	get routeTitle() {
		return this.community ? `Firesides in the ${this.community.name} Community` : null;
	}

	get loadUrl() {
		return getFetchUrl(this.$route);
	}

	routeResolved($payload: any) {
		this.firesides = Fireside.populate($payload.firesides);
	}
}
