import { Component } from 'vue-property-decorator';
import View from '!view!./wizard-finish.html';

import { RouteState, RouteStore, RouteAction } from '../../manage.store';
import { BaseRouteComponent } from '../../../../../../../lib/gj-lib-client/components/route/route-component';

@View
@Component({
	name: 'RouteDashGamesManageGameWizardFinish',
})
export default class RouteDashGamesManageGameWizardFinish extends BaseRouteComponent {
	@RouteState canPublish: RouteStore['canPublish'];
	@RouteAction publish: RouteStore['publish'];
	@RouteAction saveDraft: RouteStore['saveDraft'];

	get routeTitle() {
		return this.$gettext('The End Is Not the End');
	}
}
