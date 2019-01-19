import View from '!view!./add.html';
import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import { Community } from 'game-jolt-frontend-lib/components/community/community.model';
import {
	BaseRouteComponent,
	RouteResolver,
} from 'game-jolt-frontend-lib/components/route/route-component';
import { Component } from 'vue-property-decorator';
import { FormCommunity } from '../../../../components/forms/community/community';

@View
@Component({
	name: 'RouteDashCommunitiesAdd',
	components: {
		FormCommunity,
	},
})
@RouteResolver({
	deps: {},
	// Make sure they can add a community.
	resolver: () => Api.sendRequest('/web/dash/communities/add'),
})
export default class RouteDashCommunitiesAdd extends BaseRouteComponent {
	get routeTitle() {
		return this.$gettext('Make a Community');
	}

	onSubmit(community: Community) {
		this.$router.push({
			name: 'dash.communities.manage.design',
			params: { id: community.id + '' },
		});
	}
}
