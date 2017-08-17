import { Component } from 'vue-property-decorator';
import * as View from '!view!./maturity.html';

import { RouteState, RouteStore } from '../../manage.store';
import { Growls } from '../../../../../../../lib/gj-lib-client/components/growls/growls.service';
import { Scroll } from '../../../../../../../lib/gj-lib-client/components/scroll/scroll.service';
import { Screen } from '../../../../../../../lib/gj-lib-client/components/screen/screen-service';
import { Game } from '../../../../../../../lib/gj-lib-client/components/game/game.model';
import { AppScrollAffix } from '../../../../../../../lib/gj-lib-client/components/scroll/affix/affix';
import { AppGameOgrs } from '../../../../../../components/game/ogrs/ogrs';
import { FormGameMaturity } from '../../../../../../components/forms/game/maturity/maturity';
import { BaseRouteComponent } from '../../../../../../../lib/gj-lib-client/components/route/route-component';

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
	@RouteState game: RouteStore['game'];

	current: Game = null as any;

	Screen = Screen;

	get routeTitle() {
		if (this.game) {
			return this.$gettextInterpolate(`Edit Maturity Rating for %{ game }`, {
				game: this.game.title,
			});
		}
		return null;
	}

	routeInit() {
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
