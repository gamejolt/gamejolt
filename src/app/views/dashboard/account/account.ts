import { State } from 'vuex-class';
import { Component } from 'vue-property-decorator';
import View from '!view!./account.html';

import { makeObservableService } from '../../../../lib/gj-lib-client/utils/vue';
import { Screen } from '../../../../lib/gj-lib-client/components/screen/screen-service';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppPageHeader } from '../../../components/page-header/page-header';
import { AppUserAvatar } from '../../../../lib/gj-lib-client/components/user/user-avatar/user-avatar';
import { Store } from '../../../store/index';
import { User } from '../../../../lib/gj-lib-client/components/user/user.model';
import { RouteStoreName, RouteState, RouteStore } from './account.store';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../lib/gj-lib-client/components/route/route-component';

@View
@Component({
	name: 'RouteDashAccount',
	components: {
		AppJolticon,
		AppPageHeader,
		AppUserAvatar,
	},
})
export default class RouteDashAccount extends BaseRouteComponent {
	@State app: Store['app'];
	@RouteState heading: RouteStore['heading'];

	Screen = makeObservableService(Screen);

	storeName = RouteStoreName;
	storeModule = RouteStore;

	@RouteResolve({})
	async routeResolve() {
		User.touch();
	}
}
