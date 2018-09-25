import { Component } from 'vue-property-decorator';
import View from '!view!./details.html';

import { RouteState, RouteStore } from '../../manage.store';
import { Scroll } from '../../../../../../../lib/gj-lib-client/components/scroll/scroll.service';
import { Growls } from '../../../../../../../lib/gj-lib-client/components/growls/growls.service';
import { FormGame } from '../../../../../../components/forms/game/game';
import { BaseRouteComponent } from '../../../../../../../lib/gj-lib-client/components/route/route-component';
import { AppGameDevStageSelector } from '../../../../../../components/forms/game/dev-stage-selector/dev-stage-selector';
import {
	AppState,
	AppStore,
} from '../../../../../../../lib/gj-lib-client/vue/services/app/app-store';

@View
@Component({
	name: 'RouteDashGamesManageGameDetails',
	components: {
		FormGame,
		AppGameDevStageSelector,
	},
})
export default class RouteDashGamesManageGameDetails extends BaseRouteComponent {
	@AppState user!: AppStore['user'];
	@RouteState game!: RouteStore['game'];
	@RouteState isWizard!: RouteStore['isWizard'];

	get routeTitle() {
		if (this.game) {
			return this.$gettextInterpolate('Edit Details for %{ game }', {
				game: this.game.title,
			});
		}
		return null;
	}

	get isCollaborator() {
		return this.user!.id !== this.game.developer.id;
	}

	onSaved() {
		Growls.success(
			this.$gettext('dash.games.edit.save_growl'),
			this.$gettext('dash.games.edit.save_growl_title')
		);

		Scroll.to(0);
	}
}
