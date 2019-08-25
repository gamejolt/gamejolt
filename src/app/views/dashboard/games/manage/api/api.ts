import AppNavTabList from '../../../../../../_common/nav/tab-list/tab-list.vue';
import { BaseRouteComponent } from '../../../../../../_common/route/route-component';
import { Screen } from '../../../../../../_common/screen/screen-service';
import { Component } from 'vue-property-decorator';
import AppManageGameApiNav from './_nav/nav.vue';

@Component({
	name: 'RouteDashGamesManageApi',
	components: {
		AppManageGameApiNav,
		AppNavTabList,
	},
})
export default class RouteDashGamesManageApi extends BaseRouteComponent {
	readonly Screen = Screen;
}
