import View from '!view!./maturity.html';
import { Component } from 'vue-property-decorator';
import { Game } from '../../../../../../../lib/gj-lib-client/components/game/game.model';
import { Growls } from '../../../../../../../lib/gj-lib-client/components/growls/growls.service';
import { BaseRouteComponent } from '../../../../../../../lib/gj-lib-client/components/route/route-component';
import { Screen } from '../../../../../../../lib/gj-lib-client/components/screen/screen-service';
import { AppScrollAffix } from '../../../../../../../lib/gj-lib-client/components/scroll/affix/affix';
import { Scroll } from '../../../../../../../lib/gj-lib-client/components/scroll/scroll.service';
import { FormGameMaturity } from '../../../../../../components/forms/game/maturity/maturity';
import { AppGameOgrs } from '../../../../../../components/game/ogrs/ogrs';
import { RouteStore, RouteStoreModule } from '../../manage.store';

@View
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
