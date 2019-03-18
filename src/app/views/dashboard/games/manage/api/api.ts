import { AppNavTabList } from 'game-jolt-frontend-lib/components/nav/tab-list/tab-list';
import { BaseRouteComponent } from 'game-jolt-frontend-lib/components/route/route-component';
import { Screen } from 'game-jolt-frontend-lib/components/screen/screen-service';
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
