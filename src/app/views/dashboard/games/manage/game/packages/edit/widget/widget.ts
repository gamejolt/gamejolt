import View from '!view!./widget.html';
import { Component, Watch } from 'vue-property-decorator';
import { Api } from '../../../../../../../../../lib/gj-lib-client/components/api/api.service';
import { Environment } from '../../../../../../../../../lib/gj-lib-client/components/environment/environment.service';
import {
	BaseRouteComponent,
	RouteResolver,
} from '../../../../../../../../../lib/gj-lib-client/components/route/route-component';
import { Screen } from '../../../../../../../../../lib/gj-lib-client/components/screen/screen-service';
import { Sellable } from '../../../../../../../../../lib/gj-lib-client/components/sellable/sellable.model';

@View
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
