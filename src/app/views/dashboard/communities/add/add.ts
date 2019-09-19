import { Component } from 'vue-property-decorator';
import { Community } from '../../../../../_common/community/community.model';
import { BaseRouteComponent } from '../../../../../_common/route/route-component';
import FormCommunity from '../../../../components/forms/community/community.vue';

@Component({
	name: 'RouteDashCommunitiesAdd',
	components: {
		FormCommunity,
	},
})
export default class RouteDashCommunitiesAdd extends BaseRouteComponent {
	get routeTitle() {
		return this.$gettext('Create a Community');
	}

	onSubmit(community: Community) {
		this.$router.push(community.routeEditLocation);
	}
}
