import View from '!view!./details.html';
import { BaseRouteComponent } from 'game-jolt-frontend-lib/components/route/route-component';
import { AppState, AppStore } from 'game-jolt-frontend-lib/vue/services/app/app-store';
import { Component } from 'vue-property-decorator';
import { FormCommunity } from '../../../../../components/forms/community/community';
import { RouteStore, RouteStoreModule } from '../manage.store';

@View
@Component({
	name: 'RouteDashCommunitiesManageDetails',
	components: {
		FormCommunity,
	},
})
export default class RouteDashCommunitiesManageDetails extends BaseRouteComponent {
	@AppState
	user!: AppStore['user'];

	@RouteStoreModule.State
	community!: RouteStore['community'];

	get routeTitle() {
		if (this.community) {
			return this.$gettextInterpolate('Edit Details for %{ community }', {
				community: this.community.name,
			});
		}
		return null;
	}
}
