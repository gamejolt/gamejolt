import { Options } from 'vue-property-decorator';
import { Api } from '../../../../../../../_common/api/api.service';
import { showSuccessGrowl } from '../../../../../../../_common/growls/growls.service';
import {
	BaseRouteComponent,
	RouteResolver,
} from '../../../../../../../_common/route/route-component';
import { Scroll } from '../../../../../../../_common/scroll/scroll.service';
import FormGameDescription from '../../../../../../components/forms/game/description/description.vue';
import { RouteStore, RouteStoreModule } from '../../manage.store';

@Options({
	name: 'RouteDashGamesManageGameDescription',
	components: {
		FormGameDescription,
	},
})
@RouteResolver({
	deps: {},
	resolver: () => Api.sendRequest('/web/dash/developer/games/description'),
})
export default class RouteDashGamesManageGameDescription extends BaseRouteComponent {
	@RouteStoreModule.State
	game!: RouteStore['game'];

	tags: string[] = [];

	get routeTitle() {
		if (this.game) {
			return this.$gettextInterpolate('Edit Description for %{ game }', {
				game: this.game.title,
			});
		}
		return null;
	}

	routeResolved($payload: any) {
		this.tags = $payload.tags || [];
	}

	onSaved() {
		showSuccessGrowl(
			this.$gettext(`Your game description has been saved.`),
			this.$gettext(`Description Saved`)
		);
		Scroll.to(0);
	}
}
