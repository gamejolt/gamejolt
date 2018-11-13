import View from '!view!./details.html';
import { Component } from 'vue-property-decorator';
import { Growls } from '../../../../../../../lib/gj-lib-client/components/growls/growls.service';
import { BaseRouteComponent } from '../../../../../../../lib/gj-lib-client/components/route/route-component';
import { Scroll } from '../../../../../../../lib/gj-lib-client/components/scroll/scroll.service';
import {
	AppState,
	AppStore,
} from '../../../../../../../lib/gj-lib-client/vue/services/app/app-store';
import { AppGameDevStageSelector } from '../../../../../../components/forms/game/dev-stage-selector/dev-stage-selector';
import { FormGame } from '../../../../../../components/forms/game/game';
import { RouteStore, RouteStoreModule } from '../../manage.store';

@View
@Component({
	name: 'RouteDashGamesManageGameDetails',
	components: {
		FormGame,
		AppGameDevStageSelector,
	},
})
export default class RouteDashGamesManageGameDetails extends BaseRouteComponent {
	@AppState
	user!: AppStore['user'];

	@RouteStoreModule.State
	game!: RouteStore['game'];

	@RouteStoreModule.State
	isWizard!: RouteStore['isWizard'];

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
