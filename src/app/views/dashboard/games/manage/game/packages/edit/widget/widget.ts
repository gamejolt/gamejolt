import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import { Environment } from 'game-jolt-frontend-lib/components/environment/environment.service';
import {
	BaseRouteComponent,
	RouteResolver,
} from 'game-jolt-frontend-lib/components/route/route-component';
import { Screen } from 'game-jolt-frontend-lib/components/screen/screen-service';
import { Sellable } from 'game-jolt-frontend-lib/components/sellable/sellable.model';
import { Component, Watch } from 'vue-property-decorator';

@Component({
	name: 'RouteDashGamesManageGamePackagesEditWidget',
})
@RouteResolver({
	deps: {},
	resolver: ({ route }) =>
		Api.sendRequest(
			'/web/dash/developer/games/packages/preview/' +
				route.params.id +
				'/' +
				route.params.packageId
		),
})
export default class RouteDashGamesManageGamePackagesEditWidget extends BaseRouteComponent {
	sellable: Sellable | null = null;
	theme: string = null as any;
	widgetUrl = '';
	widgetCode = '';

	readonly Screen = Screen;

	routeResolved($payload: any) {
		this.sellable = $payload.sellable ? new Sellable($payload.sellable) : null;
		this.theme = ''; // Default to dark.
	}

	@Watch('theme')
	onThemeChanged() {
		if (!this.sellable) {
			return;
		}

		this.widgetUrl = Environment.widgetHost + '/package/v1?key=' + this.sellable.key;
		if (this.theme === 'light') {
			this.widgetUrl += '&theme=light';
		}

		this.widgetCode =
			'<iframe src="' +
			this.widgetUrl +
			'" frameborder="0" width="500" height="245"></iframe>';
	}
}
