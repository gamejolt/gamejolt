import { Options } from 'vue-property-decorator';
import AppNavTabList from '../../../../../../_common/nav/tab-list/tab-list.vue';
import { BaseRouteComponent } from '../../../../../../_common/route/route-component';
import { Screen } from '../../../../../../_common/screen/screen-service';
import AppManageGameApiNav from './_nav/nav.vue';

@Options({
	name: 'RouteDashGamesManageApi',
	components: {
		AppManageGameApiNav,
		AppNavTabList,
	},
})
export default class RouteDashGamesManageApi extends BaseRouteComponent {
	readonly Screen = Screen;
}
