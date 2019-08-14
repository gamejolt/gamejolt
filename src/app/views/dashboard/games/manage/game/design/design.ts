import { Component } from 'vue-property-decorator';
import { Api } from '../../../../../../../_common/api/api.service';
import {
	BaseRouteComponent,
	RouteResolver,
} from '../../../../../../../_common/route/route-component';
import { ThemeMutation, ThemeStore } from '../../../../../../../_common/theme/theme.store';
import FormGameDesign from '../../../../../forms/game/design/design.vue';
import { RouteStore, RouteStoreModule } from '../../manage.store';

@Component({
	name: 'RouteDashGamesManageGameDesign',
	components: {
		FormGameDesign,
	},
})
@RouteResolver({
	deps: {},
	resolver: ({ route }) => Api.sendRequest('/web/dash/developer/games/media/' + route.params.id),
})
export default class RouteDashGamesManageGameDesign extends BaseRouteComponent {
	@RouteStoreModule.State
	game!: RouteStore['game'];

	@RouteStoreModule.State
	media!: RouteStore['media'];

	@RouteStoreModule.Mutation
	populateMedia!: RouteStore['populateMedia'];

	@ThemeMutation
	setPageTheme!: ThemeStore['setPageTheme'];

	get routeTitle() {
		if (this.game) {
			return this.$gettextInterpolate(`Edit Design for %{ game }`, {
				game: this.game.title,
			});
		}
		return null;
	}

	routeResolved($payload: any) {
		this.populateMedia($payload.mediaItems || []);
	}

	onSubmit() {
		this.setPageTheme(this.game.theme || null);
	}
}
