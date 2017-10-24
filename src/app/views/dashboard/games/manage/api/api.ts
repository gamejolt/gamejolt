import { Component } from 'vue-property-decorator';
import View from '!view!./api.html';

import { makeObservableService } from '../../../../../../lib/gj-lib-client/utils/vue';
import { Screen } from '../../../../../../lib/gj-lib-client/components/screen/screen-service';
import { AppManageGameApiNav } from './_nav/nav';
import { AppNavTabList } from '../../../../../../lib/gj-lib-client/components/nav/tab-list/tab-list';
import { BaseRouteComponent } from '../../../../../../lib/gj-lib-client/components/route/route-component';

@View
@Component({
	name: 'RouteDashGamesManageApi',
	components: {
		AppManageGameApiNav,
		AppNavTabList,
	},
})
export default class RouteDashGamesManageApi extends BaseRouteComponent {
	Screen = makeObservableService(Screen);
}
