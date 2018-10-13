import View from '!view!./wizard-finish.html';
import { Component } from 'vue-property-decorator';
import { BaseRouteComponent } from '../../../../../../../lib/gj-lib-client/components/route/route-component';
import { RouteStore, RouteStoreModule } from '../../manage.store';

@View
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
