import { BaseRouteComponent } from 'game-jolt-frontend-lib/components/route/route-component';
import { Component } from 'vue-property-decorator';
import { RouteStore, RouteStoreModule } from '../../manage.store';

@Component({
	name: 'RouteDashGamesManageGameWizardFinish',
})
export default class RouteDashGamesManageGameWizardFinish extends BaseRouteComponent {
	@RouteStoreModule.State
	canPublish!: RouteStore['canPublish'];

	@RouteStoreModule.Action
	publish!: RouteStore['publish'];

	@RouteStoreModule.Action
	saveDraft!: RouteStore['saveDraft'];

	get routeTitle() {
		return this.$gettext('The End Is Not the End');
	}
}
