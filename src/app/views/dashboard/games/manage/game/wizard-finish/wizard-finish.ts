import { Component } from 'vue-property-decorator';
import * as View from '!view!./wizard-finish.html';

import { Meta } from '../../../../../../../lib/gj-lib-client/components/meta/meta-service';
import { RouteState, RouteStore, RouteAction } from '../../manage.state';
import { BaseRouteComponent } from '../../../../../../../lib/gj-lib-client/components/route/route-component';

@View
@Component({})
export default class RouteDashGamesManageGameWizardFinish extends BaseRouteComponent {
	@RouteState canPublish: RouteStore['canPublish'];
	@RouteAction publish: RouteStore['publish'];
	@RouteAction saveDraft: RouteStore['saveDraft'];

	routeInit() {
		Meta.title = this.$gettext('The End Is Not the End');
	}
}
