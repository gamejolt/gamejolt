import { Component } from 'vue-property-decorator';
import { Community } from '../../../../../_common/community/community.model';
import { BaseRouteComponent } from '../../../../../_common/route/route-component';
import FormCommunity from '../../../../components/forms/community/community.vue';
import AppPageContainer from '../../../../components/page-container/page-container.vue';

@Component({
	name: 'RouteDashCommunitiesAdd',
	components: {
		AppPageContainer,
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
