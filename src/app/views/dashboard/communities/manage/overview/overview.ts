import View from '!view!./overview.html';
import { BaseRouteComponent } from 'game-jolt-frontend-lib/components/route/route-component';
import { AppTooltip } from 'game-jolt-frontend-lib/components/tooltip/tooltip';
import { AppState, AppStore } from 'game-jolt-frontend-lib/vue/services/app/app-store';
import { Component } from 'vue-property-decorator';
import { Collaborator } from '../../../../../../lib/gj-lib-client/components/collaborator/collaborator.model';
import { AppCommunityPerms } from '../../../../../components/community/perms/perms';
import { RouteStore, RouteStoreModule } from '../manage.store';

@View
@Component({
	name: 'RouteDashCommunitiesManageOverview',
	components: {
		AppCommunityPerms,
	},
	directives: {
		AppTooltip,
	},
})
export default class RouteDashCommunitiesManageOverview extends BaseRouteComponent {
	@AppState
	user!: AppStore['user'];

	@RouteStoreModule.State
	community!: RouteStore['community'];

	@RouteStoreModule.State
	collaboration!: RouteStore['collaboration'];

	@RouteStoreModule.State
	canPublish!: RouteStore['canPublish'];

	@RouteStoreModule.Action
	publish!: RouteStore['publish'];

	@RouteStoreModule.Action
	resign!: RouteStore['resign'];

	get routeTitle() {
		return this.$gettextInterpolate('Manage %{ community }', {
			community: this.community.name,
		});
	}

	get isCollaborator() {
		if (this.collaboration && this.collaboration.role !== Collaborator.ROLE_OWNER) {
			return true;
		}
	}
}
