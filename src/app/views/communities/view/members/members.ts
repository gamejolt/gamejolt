import { Component, Prop } from 'vue-property-decorator';
import { Route } from 'vue-router';
import { Api } from '../../../../../_common/api/api.service';
import { Community } from '../../../../../_common/community/community.model';
import { BaseRouteComponent, RouteResolver } from '../../../../../_common/route/route-component';
import { User } from '../../../../../_common/user/user.model';
import AppFollowerList from '../../../follower/list/list.vue';

function getFetchUrl(route: Route) {
	return `/web/communities/members/${route.params.path}`;
}

@Component({
	name: 'RouteCommunitiesViewMembers',
	components: {
		AppFollowerList,
	},
})
@RouteResolver({
	cache: true,
	lazy: true,
	deps: {},
	resolver: ({ route }) => Api.sendRequest(getFetchUrl(route)),
})
export default class RouteCommunitiesViewMembers extends BaseRouteComponent {
	@Prop(Community)
	community!: Community;

	users: User[] = [];

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
