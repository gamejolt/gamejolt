import { Options } from 'vue-property-decorator';
import { BaseRouteComponent } from '../../../../../../../_common/route/route-component';
import { RouteStore, RouteStoreModule } from '../../manage.store';

@Options({
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
