import { Component } from 'vue-property-decorator';
import { Api } from '../../../../../../../_common/api/api.service';
import {
	BaseRouteComponent,
	RouteResolver,
} from '../../../../../../../_common/route/route-component';
import FormGameDesign from '../../../../../../components/forms/game/design/design.vue';
import { store } from '../../../../../../store';
import { ManageGameThemeKey } from '../../manage';
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
		store.commit('theme/setPageTheme', {
			key: ManageGameThemeKey,
			theme: this.game.theme ?? null,
		});
	}
}
