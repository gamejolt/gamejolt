import { Component } from 'vue-property-decorator';
import View from '!view!./details.html';

import { RouteState, RouteStore } from '../../manage.store';
import { Scroll } from '../../../../../../../lib/gj-lib-client/components/scroll/scroll.service';
import { Growls } from '../../../../../../../lib/gj-lib-client/components/growls/growls.service';
import { FormGame } from '../../../../../../components/forms/game/game';
import { BaseRouteComponent } from '../../../../../../../lib/gj-lib-client/components/route/route-component';

@View
@Component({
	name: 'RouteDashGamesManageGameDetails',
	components: {
		FormGame,
	},
})
export default class RouteDashGamesManageGameDetails extends BaseRouteComponent {
	@RouteState game: RouteStore['game'];

	get routeTitle() {
		if (this.game) {
			return this.$gettextInterpolate('Edit Details for %{ game }', {
				game: this.game.title,
			});
		}
		return null;
	}

	onSaved() {
		Growls.success(
			this.$gettext('dash.games.edit.save_growl'),
			this.$gettext('dash.games.edit.save_growl_title')
		);

		Scroll.to(0);
	}
}
