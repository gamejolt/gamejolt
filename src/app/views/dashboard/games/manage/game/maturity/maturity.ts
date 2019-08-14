import { Game } from '../../../../../../../_common/game/game.model';
import { Growls } from '../../../../../../../_common/growls/growls.service';
import { BaseRouteComponent } from '../../../../../../../_common/route/route-component';
import { Screen } from '../../../../../../../_common/screen/screen-service';
import AppScrollAffix from '../../../../../../../_common/scroll/affix/affix.vue';
import { Scroll } from '../../../../../../../_common/scroll/scroll.service';
import { Component } from 'vue-property-decorator';
import FormGameMaturity from '../../../../../../components/forms/game/maturity/maturity.vue';
import AppGameOgrs from '../../../../../../components/game/ogrs/ogrs.vue';
import { RouteStore, RouteStoreModule } from '../../manage.store';

@Component({
	name: 'RouteDashGamesManageGameMaturity',
	components: {
		AppScrollAffix,
		AppGameOgrs,
		FormGameMaturity,
	},
})
export default class RouteDashGamesManageGameMaturity extends BaseRouteComponent {
	@RouteStoreModule.State
	game!: RouteStore['game'];

	current: Game = null as any;

	readonly Screen = Screen;

	get routeTitle() {
		if (this.game) {
			return this.$gettextInterpolate(`Edit Maturity Rating for %{ game }`, {
				game: this.game.title,
			});
		}
		return null;
	}

	routeCreated() {
		this.current = this.game;
	}

	onSaved() {
		Growls.success(
			this.$gettext(`dash.games.maturity.saved_growl`),
			this.$gettext(`dash.games.maturity.saved_growl_title`)
		);

		Scroll.to(0);
	}
}
