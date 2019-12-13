import { Component } from 'vue-property-decorator';
import { Community } from '../../../../../_common/community/community.model';
import { BaseRouteComponent, RouteResolver } from '../../../../../_common/route/route-component';
import { User } from '../../../../../_common/user/user.model';
import FormCommunity from '../../../../components/forms/community/community.vue';
import AppPageContainer from '../../../../components/page-container/page-container.vue';

@Component({
	name: 'RouteDashCommunitiesAdd',
	components: {
		AppPageContainer,
		FormCommunity,
	},
})
@RouteResolver({
	deps: {},
	resolver: () => User.touch(),
})
export default class RouteDashCommunitiesAdd extends BaseRouteComponent {
	get routeTitle() {
		return this.$gettext('Create a Community');
	}

	onSubmit(community: Community) {
		this.$router.push(community.routeEditLocation);
	}
}
