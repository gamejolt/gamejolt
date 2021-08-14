import { Inject, Options } from 'vue-property-decorator';
import { RouteLocationNormalized } from 'vue-router';
import { Api } from '../../../../../_common/api/api.service';
import { BaseRouteComponent, RouteResolver } from '../../../../../_common/route/route-component';
import { User } from '../../../../../_common/user/user.model';
import AppFollowerList from '../../../../components/follower/list/list.vue';
import { CommunityRouteStore, CommunityRouteStoreKey } from '../view.store';
import AppCommunitiesViewPageContainer from '../_page-container/page-container.vue';

function getFetchUrl(route: RouteLocationNormalized) {
	return `/web/communities/members/${route.params.path}`;
}

@Options({
	name: 'RouteCommunitiesViewMembers',
	components: {
		AppFollowerList,
		AppCommunitiesViewPageContainer,
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
	@Inject({ from: CommunityRouteStoreKey })
	routeStore!: CommunityRouteStore;

	users: User[] = [];

	get community() {
		return this.routeStore.community;
	}

	get routeTitle() {
		return this.community ? `Members of the ${this.community.name} Community` : null;
	}

	get loadUrl() {
		return getFetchUrl(this.$route);
	}

	routeResolved($payload: any) {
		this.users = User.populate($payload.users);
	}
}
