import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import { Api } from '../../../../../../../_common/api/api.service';
import {
	BaseRouteComponent,
	RouteResolver,
} from '../../../../../../../_common/route/route-component';
import { useThemeStore } from '../../../../../../../_common/theme/theme.store';
import FormGameDesign from '../../../../../../components/forms/game/design/design.vue';
import { ManageGameThemeKey } from '../../manage';
import { RouteStore, RouteStoreModule } from '../../manage.store';

@Options({
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
	themeStore = setup(() => useThemeStore());

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
		this.themeStore.setPageTheme({
			key: ManageGameThemeKey,
			theme: this.game.theme ?? null,
		});
	}
}
