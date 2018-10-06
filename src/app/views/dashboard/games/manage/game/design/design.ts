import View from '!view!./design.html';
import { Component } from 'vue-property-decorator';
import { Route } from 'vue-router';
import { Api } from '../../../../../../../lib/gj-lib-client/components/api/api.service';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../../../../lib/gj-lib-client/components/route/route-component';
import {
	ThemeMutation,
	ThemeStore,
} from '../../../../../../../lib/gj-lib-client/components/theme/theme.store';
import { FormGameDesign } from '../../../../../../components/forms/game/design/design';
import { RouteMutation, RouteState, RouteStore } from '../../manage.store';

@View
@Component({
	name: 'RouteDashGamesManageGameDesign',
	components: {
		FormGameDesign,
	},
})
export default class RouteDashGamesManageGameDesign extends BaseRouteComponent {
	@RouteState
	game!: RouteStore['game'];
	@RouteState
	media!: RouteStore['media'];

	@RouteMutation
	populateMedia!: RouteStore['populateMedia'];
	@ThemeMutation
	setPageTheme!: ThemeStore['setPageTheme'];

	@RouteResolve({
		deps: {},
	})
	routeResolve(this: undefined, route: Route) {
		return Api.sendRequest('/web/dash/developer/games/media/' + route.params.id);
	}

	get routeTitle() {
		if (this.game) {
			return this.$gettextInterpolate(`Edit Design for %{ game }`, {
				game: this.game.title,
			});
		}
		return null;
	}

	routed($payload: any) {
		this.populateMedia($payload.mediaItems || []);
	}

	onSubmit() {
		this.setPageTheme(this.game.theme || null);
	}
}
